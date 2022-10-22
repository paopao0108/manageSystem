import { login, logout, getInfo } from '@/api/user';
import { getToken, setToken, removeToken } from '@/utils/auth';
import { resetRouter } from '@/router';

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  }
};

const actions = {
  // 处理登陆业务
  async login({ commit }, userInfo) {
    // 解构出用户名和密码
    const { username, password } = userInfo;
    const result = await login({ username: username.trim(), password: password });
    console.log(result);
    // 注意 当前登录的请求使用的是mock数据，moke数据是20000
    if (result.code === 20000) {
      commit('SET_TOKEN', result.data.token);
      setToken(result.data.token);
      return 'OK';
    } else {
      return Promise.reject(new Error('fail'));
    }
    // 原代码 是返回的Promise对象 改写成了上面的async、await
    // return new Promise((resolve, reject) => {
    //   login({ username: username.trim(), password: password })
    //     .then(response => {
    //       const { data } = response;
    //       commit('SET_TOKEN', data.token);
    //       setToken(data.token);
    //       resolve();
    //     })
    //     .catch(error => {
    //       reject(error);
    //     });
    // });
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then(response => {
          const { data } = response;

          if (!data) {
            return reject('Verification failed, please Login again.');
          }

          const { name, avatar } = data;

          commit('SET_NAME', name);
          commit('SET_AVATAR', avatar);
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken(); // must remove  token  first
          resetRouter();
          commit('RESET_STATE');
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken(); // must remove  token  first
      commit('RESET_STATE');
      resolve();
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
