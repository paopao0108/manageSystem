import request from '@/utils/request.js';

// 获取品牌列表
export const reqTrademarkList = (page, limit) => {
  return request({
    url: `/admin/product/baseTrademark/${page}/${limit}`,
    method: 'get'
  });
};

// 处理添加品牌
// 发起post请求，携带两个参数：品牌名称、品牌logo（无需传递ID）

// 处理修改品牌
// 发起put请求，携带三个参数：品牌名称、品牌logo、ID
export const reqAddorEditTrademark = tmForm => {
  if (tmForm.id) {
    // 当传入的的数据含有id时，则为修改品牌
    return request({
      url: '/admin/product/baseTrademark/update',
      method: 'put',
      data: tmForm
    });
  } else {
    // 当传入的数据没有携带id时，为添加品牌
    return request({
      url: '/admin/product/baseTrademark/save',
      method: 'post',
      data: tmForm
    });
  }
};

// 删除
export const deleteTradeMark = id => {
  return request({
    url: `/admin/product/baseTrademark/remove/${id}`,
    method: 'delete'
  });
};
