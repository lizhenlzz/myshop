var express = require('express');
var router = express.Router();
var User=require('../models/user');
require('./../util/util');
// console.log(User)
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/login",function (req,res,next) {
    let param={
      userName:req.body.userName,
      userPwd:req.body.userPwd
    }
    console.log(param)
    //把用户名和密码去数据库查询
    User.findOne(param,function (err,doc) {
        console.log(doc);
        if(err){
            console.log('err')
            res.json({status:1,msg:"用户名或密码错误"})
        } else {
            res.cookie('userId',doc.userId,{
                path:'/',
                maxAge:1000*60*60
            })
            res.cookie('userName',doc.userName,{
                path:'/',
                maxAge:1000*60*60
            })
            if(doc){
                res.json({
                    status:0,
                    msg:'',
                    result:{
                        userName:doc.userName
                    }
                })
            }
        }
    })
})
router.post('/checkLogin',function (req,res,next) {
    if(req.cookies.userId){
      res.json({
          status:'0',
          result:req.cookies.userName
      })
    }else {
      res.json({
          status:1,
          msg:'未登录',
          result:''
      })
    }
})
router.post('/logout',function (req,res,next) {
    res.cookie('userId','',{
      path:'/',
      maxAge:-1
    })
    res.json({
        status:0,
        msg:'',
        result:"退出成功"
    })
})
router.post('/cart',function (req,res,next) {
  let userId=req.cookies.userId;
  User.findOne({userId:userId},function (err,doc) {
      if(err){
          res.json({
              status:'1',
              msg:err.message,
              result:''
          })
      }else{
          res.json({
              status:'0',
              msg:'',
              result:doc.cartList
          })
      }
  })
})

router.post('/cartEdit',function (req,res,next) {
    let userId=req.cookies.userId,
        productId=req.body.productId,
        checked=req.body.checked,
        productNum=req.body.productNum;

     User.update({'userId':userId,'cartList.productId':productId},{
         'cartList.$.productNum':productNum,
         'cartList.$.checked':checked
     },function (err,doc) {
         if (err){
             res.json({
                 status:'1',
                 msg:err.message,
                 result:''
             })
         }else {
             res.json({
                 status:'0',
                 msg:'',
                 result:'添加购物车成功'
             })
         }
     })
})
router.post('/editCheckAll',function (req,res,next) {
    let userId=req.cookies.userId,
        checkAll=req.body.checkAll;
    User.findOne({'userId':userId},function (err,user) {
        if (err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            })
        }else {
            user.cartList.forEach((item)=>{
                item.checked=checkAll;
            })
            user.save(function (err1,doc1) {
                if (err1){
                    res.json({
                        status:'1',
                        msg:err.message,
                        result:''
                    })
                }else {
                    res.json({
                        status:'0',
                        msg:'',
                        result:'操作成功'
                    })
                }
            })
        }
    })
})
router.post('/cartDel',function (req,res,next) {
    var userId=req.cookies.userId,productId=req.body.productId
    User.update({
        userId:userId
    },{
        $pull:{
            'cartList':{
                'productId':productId
            }
        }
    },function (err,doc) {
        if (err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            })
        }else{
            res.json({
                status:'0',
                msg:'',
                result:'删除成功'
            })
        }
    })
})
//收货地址列表接口
router.get('/addressList',function (req,res,next) {
    var userId=req.cookies.userId;
    User.findOne({userId:userId},function (err,doc) {
        if (err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            })
        }else{
            res.json({
                status:'0',
                msg:'',
                result:doc.addressList
            })
        }
    })
})
router.post('/setDefault',function (req,res,next) {
    var userId=req.cookies.userId,
        addressId=req.body.addressId;
    if(!addressId){
        res.json({
            status:'1003',
            msg:'addressId is null'
        })
    }else{
        User.findOne({userId:userId},function (err,doc) {
            var addressList=doc.addressList;
            addressList.forEach((item)=>{
                if (item.addressId==addressId){
                    item.isDefault=true;
                }else{
                    item.isDefault=false;
                }
            })
            doc.save(function (err1,doc1) {
                if (err1){
                    res.json({
                        status:'1',
                        msg:err.message,
                        result:''
                    })
                }else {
                    res.json({
                        status:'0',
                        msg:'',
                        result:doc1
                    })
                }
            })
        })
    }
})
router.post('/payMent',function (req,res,next) {
    var userId=req.cookies.userId,
        addressId=req.body.addressId,
        orderTotal=req.body.orderTotal;
     User.findOne({userId:userId},function (err,doc) {
         if (err){
             res.json({
                 status:'1',
                 msg:err.message,
                 result:''
             })
         }else{
            var address='',
                goodList=[];
            //获取当前用户的地址信息
            doc.addressList.forEach((item)=>{
                if(item.addressId==addressId){
                    address=item;
                }
            })
             //获取用户购物车购买的商品
             doc.cartList.filter((item)=>{
                if(item.checked=="1"){
                    goodsList.push(item);
                }
             })
             var platform='622';
             var r1=Math.floor(Math.random()*10);
             var r2=Math.floor(Math.random()*10);
             var sysData=new Date().Format('yyyyMMddhhmmss');
             var orderId=platform+r1+sysData+r2;//生成的订单号
             var createData=new Date().Format('yyyy-MM-dd hh:mm:ss')//下单日期
             var order={
                 orderId:orderId,
                 orderTotal:orderTotal,
                 addressInfo:address,
                 goodList:goodList,
                 orderStatus:'10',
                 createData:createData
             }
             doc.orderList.push(order);
             doc.save(function (err1,doc1) {
                 if(err1){
                     res.json({
                         status:'1',
                         msg:err.message,
                         result:''
                     })
                 }else {
                     res.json({
                         status:'0',
                         msg:'',
                         result:{orderId:orderId,orderTotal:orderTotal}
                     })
                 }
             })
         }
     })
})
router.get("/orderDetail",function (req,res,next) {
    var userId=req.cookies.userId,
        orderId=req.param("orderId")
    User.findOne({userId:userId},function (err,userInfo) {
        if (err){
            res.json({
                status: "1",
                msg: err.message,
                result: ''
            })
        }else {
            var orderList=userInfo.orderList;
            if (orderList.length>0){
                var orderTotal=0;
                orderList.forEach((item)=>{
                    if (item.orderId==orderId){
                        orderTotal=item.orderTotal;
                    }
                })
                if (orderTotal>0){
                    res.json({
                        status: '0',
                        msg: '',
                        result: {
                            orderId:orderId,
                            orderTotal:orderTotal
                        }
                    })
                }
            }else {
                res.json({
                    status: "1110",
                    msg: '当前未创建订单',
                    result:''
                })
            }
        }
    })
})
module.exports = router;
