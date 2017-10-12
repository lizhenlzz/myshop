<template>
<div>
  <HeadNav/>
  <nav-bread><span>购买完毕</span></nav-bread>
  <div class="container">
    <div class="page-title-normal">
      <h2 class="page-title-h2"><span>查看</span></h2>
    </div>
    <!-- 进度条 -->
    <div class="check-step">
      <ul>
        <li class="cur"><span>确认地址</span></li>
        <li class="cur"><span>查看订单</span></li>
        <li class="cur"><span>付款</span></li>
        <li class="cur"><span>确认订单</span></li>
      </ul>
    </div>

    <div class="order-create">
      <div class="order-create-pic"><img src="/static/img/ok-2.png" alt=""></div>
      <div class="order-create-main">
        <h3>恭喜! <br>你的订单正在处理中!</h3>
        <p>
          <span>订单号：{{orderId}}</span>
          <span>合计订单：{{orderTotal}}</span>
        </p>
        <div class="order-create-btn-wrap">
          <div class="btn-l-wrap">
            <router-link class="btn btn--m" to="/cart">返回购物车</router-link>
          </div>
          <div class="btn-r-wrap">
            <router-link class="btn btn--m" to="/">返回首页</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer/>
</div>
</template>
<script>
  import HeadNav from '@/components/Head'
  import NavBread from '@/components/NavBread'
  import Footer from '@/components/Footer'
  import Modal from '@/components/Modal'
  export default{
      data(){
          return{
              orderId:'',
              orderTotal:0
          }
      },
      components: {
        HeadNav,
        NavBread,
        Footer,
        Modal
      },
      mounted(){
          var orderId=this.$route.query.orderId;
          if(!orderId){
              return;
          }
          this.$http.get("/users/orderDetail",{
              params:{
                orderId:orderId
              }
          }).then((response)=>{
              let res=response.data;
              console.log(res.status)
              if(res.status=='0'){
                  this.orderId=orderId;
                  this.orderTotal=res.result.orderTotal
              }
          })
      }
  }

</script>
