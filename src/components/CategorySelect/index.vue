<template>
  <div>
    <!--
        inline 代表的是行内表单，代表一行可以放置多个表单元素
       -->
    <el-form :inline="true" class="demo-form-inline" :model="categoryForm">
      <!-- :model 用于收集整个表单的数据 -->
      <el-form-item label="一级分类">
        <el-select v-model="categoryForm.category1Id" placeholder="请选择" @change="handleChange1">
          <!-- v-model用于收集选项的值，由于后续需要用于筛选二级分类，因此需要收集的是数据的id，而v-model收集的是value的值 -->
          <!-- change事件是自定义事件，当选择不同值时会触发，且会将收集的值传入 -->
          <el-option v-for="item in list1" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select v-model="categoryForm.category2Id" placeholder="请选择" @change="handleChange2">
          <el-option v-for="item in list2" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select v-model="categoryForm.category3Id" placeholder="请选择" @change="handleChange3">
          <el-option v-for="item in list3" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CategorySelect',
  data() {
    return {
      list1: [],
      list2: [],
      list3: [],
      categoryForm: {
        category1Id: '',
        category2Id: '',
        category3Id: ''
      }
    };
  },
  mounted() {
    this.getCategoryList();
  },
  methods: {
    // 发请求获取一级分类的数据
    async getCategoryList() {
      const res1 = await this.$api.attr.Category1List();
      console.log('一级分类数据', res1);
      if (res1.code === 200) {
        this.list1 = res1.data;
      }
    },
    // 当一级分类选择不同的值时的处理：需要发请求获取二级分类的数据
    async handleChange1(id) {
      // 一级分类变化，二三级分类收集的id需清空
      this.categoryForm.category2Id = '';
      this.categoryForm.category3Id = '';

      console.log('一级分类选项变化传入的id', id);
      // 每一级分类选择变化时，都会发起自定义事件
      this.$emit('getCategory', { categoryId: id, level: 1 });
      const res2 = await this.$api.attr.Category2List(id);
      console.log('二级分类数据', res2);
      if (res2.code === 200) {
        this.list2 = res2.data;
      }
    },

    // 当二级分类选择不同的值时的处理：需要发请求获取三级分类的数据
    async handleChange2(id) {
      // 二级分类变化，三级分类收集的id需清空
      this.categoryForm.category3Id = '';
      console.log('二级分类选项变化传入的id', id);

      this.$emit('getCategory', { categoryId: id, level: 2 });

      const res3 = await this.$api.attr.Category3List(id);
      console.log('三级分类数据', res3);
      if (res3.code === 200) {
        this.list3 = res3.data;
      }
    },
    // 当三级分类选择不同值时的处理
    handleChange3(id) {
      console.log('二级分类选项变化传入的id', id);

      this.$emit('getCategory', { categoryId: id, level: 3 });
    }
  }
};
</script>

<style></style>
