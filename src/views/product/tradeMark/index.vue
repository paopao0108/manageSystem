<template>
  <div>
    <!-- 按钮 -->
    <el-button type="primary" icon="el-icon-plus" style="margin: 10px 0" @click="showDialog">添加</el-button>
    <!-- 表格组件 -->
    <el-table :data="list" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80px" align="center" />
      <el-table-column prop="tmName" label="品牌名称" />
      <el-table-column label="品牌LOGO">
        <!-- 通过作用域插槽 将数据回传回来 必须用row来解构获取每一项数据 -->
        <template slot-scope="{ row }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 70px" />
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="handleEdit(scope.row, scope.$index)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row, scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--
      分页器：
      当前第几页 数据总条数 每一页展示条数 连续页码数
      @size-change="handleSizeChange" 一页展示的数据条数发生变化的时候触发函数
      @current-change="handleCurrentChange" 当前页码发生变化的时候触发函数
      current-page 当前第几页
      total 分页器一共需要展示多少条数据
      page-size 每一页需要展示多少条数据
      pages-size 可以设置每一页可以展示的数据条数
      layout 实现分页器布局
      pager-count 页码按钮的数量 若设为 9，则连续页码是7
    -->
    <el-pagination style="margin-top: 20px; text-align: center" :current-page="page" :page-sizes="[3, 5, 10, 100]" :page-size="size" :total="total" layout="prev, pager, next, jumper, ->, sizes, total" :pager-count="5" @current-change="getPageList" @size-change="handleSizeChange" />

    <!-- 对话框 -->
    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <!--
        表单
        :model 用于收集表单, 将表单的数据收集到那个对象的身上，将来用于表单验证也需要这个属性
        Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可
      -->
      <el-form ref="ruleForm" style="width: 80%" :model="tmForm" :rules="rules">
        <el-form-item label="品牌名称" label-width="120px" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="120px" prop="logoUrl">
          <!-- 此处收集数据时，由于上传图片不是表单元素，所以不能使用v-model
          action：用于设置图片的上传地址（后端有提供）
           -->
          <el-upload class="avatar-uploader" action="/dev-api/admin/product/fileUpload" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TradeMark',
  data() {
    // 自定义校验规则
    var validatePass = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error('注意品牌名称2-10个字符'));
      } else {
        callback();
      }
    };
    return {
      // 当前页码
      page: 1,
      // 每一个页的数据条数
      size: 5,
      // 数据总条数
      total: 0,
      // 数据列表
      list: [],
      // 是否显示对话框
      dialogFormVisible: false,
      imageUrl: '',
      tmForm: {
        tmName: '',
        logoUrl: ''
      },

      // 表单验证规则
      rules: {
        tmName: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          // { min: 2, max: 10, message: '品牌名称2-10个字符', trigger: 'change' }
          { validator: validatePass, trigger: 'change' } // validatePass是自定义的校验规则
        ],
        logoUrl: [{ required: true, message: '请上传品牌LOGO' }]
      }
    };
  },

  // 组件挂载完毕
  mounted() {
    // console.log(this.$api);
    this.getPageList();
  },
  methods: {
    // 获取品牌列表数据
    async getPageList(pager = 1) {
      this.page = pager;
      // const { page, size } = this;
      // 获取品牌列表的接口
      const res = await this.$api.tradeMark.reqTrademarkList(this.page, this.size);
      // console.log('品牌列表数据获取结果', res);
      if (res.code === 200) {
        this.list = res.data.records;
        this.total = res.data.total;
      }
    },

    // 当分页器的某一页需要展示的数据条数发生变化时会触发
    handleSizeChange(size) {
      // console.log('一个页面展示数据条数', size);
      this.size = size;
      this.getPageList();
    },

    // 点击 添加 按钮进行显示对话框
    showDialog() {
      this.dialogFormVisible = true;
      this.tmForm = {
        tmName: '',
        logoUrl: ''
      };
    },
    // 点击 修改 按钮，显示对话框
    handleEdit(row) {
      // 1 显示对话框
      this.dialogFormVisible = true;
      // console.log('点击修改拿到的数据', row);
      // 2 对话框中需要显示当前列表的数据（品牌名称 和 品牌LOGO）
      // 不能直接将 row 赋值给 tmForm（浅拷贝），否则tmForm将会直接指向服务器返回的数据，修改tmForm就会直接修改返回的数据
      // 需要深拷贝，这样修改tmForm才不会影响原来的数据
      this.tmForm = { ...row };
    },

    // 图片上传成功的操作
    handleAvatarSuccess(res, file) {
      // res：上传成功之后返回的前端数据
      // file： 上传成功之后服务器返回的前端数据
      // console.log('上传成功', res);
      this.tmForm.logoUrl = res.data;
    },
    // 图片上传前
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },

    // 点击对话框 确认 按钮
    addOrUpdateTradeMark() {
      // 需要全部验证的字段都通过后，再进行业务逻辑的书写
      this.$refs.ruleForm.validate(async success => {
        // console.log('是否验证成功', success);
        if (success) {
          this.dialogFormVisible = false;
          // 发请求 （添加品牌 或 修改品牌）
          const res = await this.$api.tradeMark.reqAddorEditTrademark(this.tmForm);
          // console.log('对话框确认按钮', res);
          if (res.code === 200) {
            // 弹出信息： 添加品牌成功 或者 修改品牌成功
            this.$message({
              message: this.tmForm.id ? '修改品牌成功' : '添加品牌成功',
              type: 'success'
            });
            // 添加或修改 品牌数据成功后，需要再次获取品牌列表进行展示.若有id则是修改操作，获取列表后页码还是当前页码；若没有id则是添加操作，获取列表后，需要跳转到首页
            this.getPageList(this.tmForm.id ? this.page : 1);
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },

    // 点击对话框 取消 按钮
    handleCancel() {
      this.dialogFormVisible = false;
    },

    // 点击 删除 按钮
    handleDelete(row) {
      // console.log('点击删除按钮', row);
      this.$confirm(`确定删除${row.tmName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 点击 确认 按钮
          // 发请求删除当前点品牌
          const res = await this.$api.tradeMark.deleteTradeMark(row.id);
          // console.log('删除是否成功', res);
          if (res.code === 200) {
            // 删除成功
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            // 需要重新获取列表，且需要判断当前页面是否还有数据，没有数据就跳转到上一页，否则停留在当前页
            this.getPageList(this.list.length > 1 ? this.page : this.page - 1); // 此处的判断应该是否大于1，而不是大于0
          }
        })
        .catch(() => {
          // 点击 取消 按钮
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    }
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
