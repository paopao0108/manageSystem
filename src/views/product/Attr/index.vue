<template>
  <div>
    <el-card style="margin: 20px 0">
      <!--
        @getCategory 触发自定义事件，由于每一级选项发生变化时都会触发，因此需要判断
        当前获取到的id是哪一级的
      -->
      <CategorySelect @getCategory="getCategoryForm" />
    </el-card>

    <el-card>
      <div v-show="isShowTable">
        <!-- 添加属性按钮需要用户确定三级分类后才可点击，否则禁用 -->
        <el-button type="primary" icon="el-icon-plus" :disabled="!c3Id" @click="addAttr">添加属性</el-button>
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column type="index" prop="date" label="序号" width="80" align="center" />
          <el-table-column prop="attrName" label="属性名称" />
          <el-table-column label="属性值列表" width="600">
            <template slot-scope="{ row, $index }">
              <!-- <el-tag>{{ row }}</el-tag> -->
              <el-tag v-for="item in row.attrValueList" :key="item.id" type="success" size="mini" style="margin-right: 10px">{{ item.valueName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <!-- 删除和编辑操作都需要用到回传的数据 -->
              <el-button type="warning" size="mini" icon="el-icon-edit" @click="updateAttr(row)" />
              <el-button type="danger" size="mini" icon="el-icon-delete" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="!isShowTable">
        <el-form :inline="true" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input v-model="attrInfo.attrName" placeholder="请输入属性名" />
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus" :disabled="!attrInfo.attrName" @click="addAttrValue">添加属性值</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table border style="margin: 20px 0" :data="attrInfo.attrValueList">
          <el-table-column type="index" label="序号" align="center" width="80" />

          <el-table-column prop="prop" label="属性值名称">
            <template slot-scope="{ row, $index }">
              <el-input v-if="row.flag" v-model="row.valueName" placeholder="请输入属性值名称" size="mini" @blur="toLook(row)" />
              <span v-else style="display: block" @click="row.flag = true">{{ row.valueName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <el-button type="danger" icon="el-icon-delete" size="mini" />
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary">保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from '../../../../node_modules/lodash/cloneDeep';
export default {
  name: 'Attr',
  data() {
    return {
      c1Id: '',
      c2Id: '',
      c3Id: '',
      attrList: [],
      isShowTable: false,
      attrInfo: {
        attrName: '', // 属性名，如 颜色
        attrValueList: [
          // 属性名中的属性值, 刚开始为空，里面的数据格式如下
          // {
          //   attrId: 0, // 属性名的id，即告诉该属性值归属于哪个属性名
          //   valueName: '' // 属性值，如 黑色
          // }
        ],
        categoryId: 0, // category3Id 三级属性的id，不能写this.c3Id来收集，因为对象是无序的，收集不到
        categoryLevel: 3 // 3 第几级的id
      }
    };
  },
  methods: {
    // 自定义事件触发的处理函数
    getCategoryForm(val) {
      console.log('获取到的id', val);
      if (val.level === 1) {
        this.c1Id = val.categoryId;
        this.c2Id = '';
        this.c3Id = '';
      } else if (val.level === 2) {
        this.c2Id = val.categoryId;
        this.c3Id = '';
      } else {
        this.c3Id = val.categoryId;
        // 当用户确定三级分类后（即有id），就需要发请求获取平台属性数据进行展示
        this.getAttrList();
      }
    },

    // 根据三个级别的分类获取平台属性数据
    async getAttrList() {
      console.log('获取平台属性数据');
      const { c1Id, c2Id, c3Id } = this; // 从this中解构出需要用到的数据
      const res = await this.$api.attr.getAttrList(c1Id, c2Id, c3Id);
      console.log('平台属性数据', res);
      if (res.code === 200) {
        this.attrList = res.data;
      }
    },

    // 当点击 添加属性值 按钮时，向属性值列表中添加元素
    addAttrValue() {
      this.attrInfo.attrValueList.push({
        /* 1. attrId: 是相应属性的id
        1.1 如果是添加属性操作，还没有相应的属性id，因此是undefined;
        1.2 如果是修改属性值操作，那么相应属性已经有id，可以直接将id赋给attrId, 当添加属性操作时，由于没有id，this.attrInfo.id也刚好是undefined
        */
        // 2. valueName：是相应的属性值的名称
        attrId: this.attrInfo.id,
        valueName: '',
        // 为每一个属性值元素增加一个flag变量，用于切换查看模式和编辑模式（input和span的切换）
        // 注意：不能直接将flag在data(){}中返回，因为这样只有一个flag 不能控制多个input和span，会导致所有input和span都依赖于一个标记变量flag，这显然不是想要的效果
        flag: true
      });
    },

    // 点击 添加属性 时，1 需要隐藏table；2 需要将之前收集的数据清空 3 可以收集获取到的三级分类Id
    addAttr() {
      this.isShowTable = false;
      // 添加属性需要先清空上一次添加的数据
      this.attrInfo = {
        attrName: '', // 属性名，如 颜色
        attrValueList: [],
        categoryId: this.c3Id, // 此处可以收集分类ID，可以写this.c3Id,因为点击添加属性时必须要有三级分类Id才可以点击
        categoryLevel: 3 // 3 第几级的id
      };
    },

    // 点击 修改 按钮时，1 需要隐藏table 2 需要将当前行的属性赋值给attrInfo
    updateAttr(row) {
      this.isShowTable = false;
      console.log('当前行的属性信息', row);
      /* 需要将row里面的数据拷贝给 this.attrInfo 进行展示
      1 但 row的数据是 对象里面有数组 数组里面还有对象 因此需要深拷贝, 使用 loadsh里面的cloneDeep
      2 row 里面的数据还有一个 属性名id 都一起赋值给 attrInfo
      3 row的数据格式：
        {
          attrName: '',
          attrValueList: [
            {
              attrId: 113,  // 就是属性名ID
              id: 191,
              valueName: ""
            }
          ],
          categoryId: 0,
          categoryLevel: 3,
          id: 113          // 服务器返回的row里面带有属性名ID
        }
      */
      this.attrInfo = cloneDeep(row);
    },

    // 输入属性值时失去焦点，切换为查看模式
    toLook(row) {
      /* 切换为查看模式的注意事项：
      1. 失去焦点时，需要检查是否为合法的值，不能输入的都是空格
      2. 失去焦点时，需要检查输入的属性值是否为已存在的属性值，不能输入已存在的属性值
      以上两种情况不成立时无法切换为查看模式，停留在编辑模式
      */
      console.log('输入的属性值', row);
      // 情况1
      row.valueName = row.valueName.trim(); // 去除字符串左右的空格
      if (row.valueName === '') {
        this.$message({
          type: 'warning',
          message: '请输入合法的属性值'
        });
        return;
      }
      // 情况2
      const isRepeat = this.attrInfo.attrValueList.some(item => {
        // 查找 添加的属性值 与 已存在的属性值 是否重复时，需要先排除当前刚添加进属性值列表的row
        if (item !== row) {
          // 当遍历的元素 与 当前刚输入的 不等时
          return item.valueName === row.valueName;
        }
      });
      console.log('isRepeat', isRepeat);
      if (isRepeat) {
        this.$message({
          type: 'warning',
          message: '请不要输入重复的属性值'
        });
        return;
      }
      // flag为false时切换为查看模式
      row.flag = false;
    }

    // 点击 保存 按钮时，发请求提交数据
  }
};
</script>

<style></style>
