import request from '@/utils/request';

// 获取一级分类 get
export const Category1List = () => {
  return request({
    url: '/admin/product/getCategory1',
    method: 'get'
  });
};

// 获取二级分类 get
export const Category2List = category1Id => {
  return request({
    url: `/admin/product/getCategory2/${category1Id}`,
    method: 'get'
  });
};

// 获取三级分类 get
export const Category3List = category2Id => {
  return request({
    url: `/admin/product/getCategory3/${category2Id}`,
    method: 'get'
  });
};

// 获取平台属性数据
export const getAttrList = (category1Id, category2Id, category3Id) => {
  return request({
    url: `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
    method: 'get'
  });
};

// 添加平台属性接口 post
export const addAttr = data => {
  return request({
    url: '/admin/product/saveAttrInfo',
    method: 'post',
    data
  });
};

/*
发送给服务器的data格式：
{
  "attrName": "", // 属性名，如 颜色
  "attrValueList": [  // 属性名中的属性值，如： 黑色、粉色
    {
      "attrId": 0,  // 属性的id，即告诉该属性值归属于哪个属性名
      "valueName": "string" // 属性值，如 黑色
    }
  ],
  "categoryId": 0,  // category3Id
  "categoryLevel": 0  // 3 第几级的id
}

*/
