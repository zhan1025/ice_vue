<template>
<div class="pay" v-if="show">
    <div class="content">
        <!--标题栏-->
        <header class="pay-title">
            <div class="ico-back" @click="cancel"></div>
            <h3>{{title}}</h3>
        </header>

        <!--密码框-->
        <div class="pass-box">
            <ul class="pass-area">
                <li class="pass-item"
                    v-for="(item, index) in digit"
                    :class="{'on': state.password.length> index}"
                    :key="index"></li>
            </ul>
        </div>

        <!--忘记密码-->
        <div class="forget-pass">
            <div class="forget-pass-btn" @click="forget">忘记密码</div>
        </div>

        <!--键盘区-->
        <ul class="keyboard">
            <li @click="onKeyboard(1)">
                <p class="num"><strong>1</strong></p>
                <p class="character"></p>
            </li>
            <li @click="onKeyboard(2)">
                <p class="num"><strong>2</strong></p>
                <p class="character">ABC</p>
                </li>
            <li @click="onKeyboard(3)">
                <p class="num"><strong>3</strong></p>
                <p class="character">DEF</p>
            </li>
            <li @click="onKeyboard(4)">
                <p class="num"><strong>4</strong></p>
                <p class="character">GHI</p>
            </li>
            <li @click="onKeyboard(5)">
                <p class="num"><strong>5</strong></p>
                <p class="character">JKL</p>
            </li>
            <li @click="onKeyboard(6)">
                <p class="num"><strong>6</strong></p>
                <p class="character">MNO</p>
            </li>
            <li @click="onKeyboard(7)">
                <p class="num"><strong>7</strong></p>
                <p class="character">PQRS</p>
            </li>
            <li @click="onKeyboard(8)">
                <p class="num"><strong>8</strong></p>
                <p class="character">TUV</p>
            </li>
            <li @click="onKeyboard(9)">
                <p class="num"><strong>9</strong></p>
                <p class="character">WXYZ</p>
            </li>
            <li class="none"></li>
            <li class="zero" @click="onKeyboard(0)"><strong>0</strong></li>
            <li class="delete" @click="deleteKey"><strong>←</strong></li>
        </ul>

        <!--加载中状态-->
        <div class="loading-wrap" v-if="state.payStatus !== 0">
            <div class="loading">
                <!--加载图标-->
                <img src="" class="loading-ico" alt="loading" v-if="state.payStatus === 1">
                <img src="" class="success-ico" alt="success" v-if="state.payStatus === 2">
                <!--加载文字-->
                <p v-if="state.payStatus === 1">{{loadingText}}</p>
                <p v-if="state.payStatus === 2">{{finishedText}}</p>
            </div>
        </div>

        <!--支付失败提示框-->
        <div class="pay-fail" v-if="state.isShowFail">
            <div class="pay-fail-lay">
                <h3 class="title">{{state.failTip}}</h3>
                <div class="btns">
                    <div @click="reInput">重新输入</div>
                    <div @click="forget">忘记密码</div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue';

export default defineComponent({
  // 支付密码框位数
  props: {
    // 支付密码框位数
    digit: {
      type: Number,
      default: 6,
    },
    // 组件的显示隐藏
    show: {
      type: Boolean,
      required: true,
      default: false,
    },
    // 弹窗标题
    title: {
      type: String,
      default: '请输入支付密码',
    },
    // 正在支付的文字提示
    loadingText: {
      type: String,
      default: '正在支付',
    },
    // 支付成功的文字提示
    finishedText: {
      type: String,
      default: '支付成功',
    },
    // 支付成功的提示显示时间
    duration: {
      type: Number,
      default: 500,
    },
  },
  setup(props, ctx) {
    const state = reactive({
      password: '', // 支付密码
      payStatus: 0, //  支付状态，0无状态,1正在支付,2支付成功
      failTip: '支付密码错误',
      isShowFail: false,
    });
    watch(
    // 监听支付密码，支付密码输入完成后触发input-end回调
    // 通知父组件的同时会把输入完成的密码作为参数告知父组件，即input-end函数的参数能拿到密码
      () => state.password,
      (n, o) => {
        if (n.length === props.digit) {
          state.payStatus = 1;
          ctx.emit('input-end', state.password);
        }
      },
    );
    function onKeyboard(key: string): void {
      state.password = (state.password + key).slice(0, 6);
    }
    function deleteKey(): void {
      // 密码已经为空时，不回删
      if (state.password.length !== 0) {
        state.password = state.password.slice(0, state.password.length - 1);
      }
      // 回删一位密码
    }
    // 取消支付
    function cancel(): void {
      // 支付过程中，不允许取消支付
      if (state.payStatus === 1) return;
      // 清空密码
      state.password = '';
      // 恢复支付状态
      state.payStatus = 0;
      // 关闭组件，并触发父子组件数据同步
      ctx.emit('change', false);
      // 触发父组件close自定义事件
      ctx.emit('close');
    }
    // 支付成功
    function success(): object {
      return new Promise((resolve) => {
        // 支付成功立即显示成功状态
        state.payStatus = 2;
        // 待指定间隔后，隐藏整个支付弹窗，并resolve
        setTimeout(() => {
          cancel();
          resolve();
        }, props.duration);
      });
    }
    // 支付失败
    // 隐藏加载提示框，显示支付失败确认框
    function fail(tip: string) {
      if (tip && (state.failTip === tip)) {
      // 隐藏掉支付状态窗口
        state.payStatus = 0;
        // 显示密码错误弹窗
        state.isShowFail = true;
      }
    }
    // 重新输入
    // 清空之前输入的密码，隐藏支付失败的提示框
    function reInput() {
      state.password = '';
      state.isShowFail = false;
    }
    // 忘记密码,触发父组件的forget自定义事件
    function forget() {
      ctx.emit('forget');
    }

    return {
      onKeyboard, deleteKey, cancel, success, fail, reInput, forget, state,
    };
  },
});
</script>
<style  lang='less' scoped>
 * {
        padding: 0;
        margin: 0;
        font-size: 14px;
    }
    ul, li {
        list-style: none;
    }
    .pay {
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        max-width: 750px;
        z-index: 998;
        background: rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column-reverse;
    }
    .content {
        background: #fafafa;
        position: relative;
        .pay-title {
        position: relative;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #e5e5e5;
        h3 {
        font-size: 18px;
        font-weight: normal;
        text-align: center;
        }
      }
      .ico-back {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 40px;
        }
    }
    /* 密码框 */
    .pass-box {
        padding: 0 20px;
    }
    .pass-area {
        display: flex;
        height: 40px;
        margin-top: 20px;
        border: 1px solid #e7e7e7;
        border-radius: 4px;
        background: #fff;
        .pass-item {
        position: relative;
        flex: 1;
        border-right: 1px solid #e7e7e7;
        }
        .pass-item:last-child {
        border-right: 0;
        }
        .pass-item.on::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 8px;
        height: 8px;
        background: #000;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        }
    }
    /* 密码框 */
    .forget-pass {
        padding: 10px 20px 0;
        text-align: right;
    }
    .forget-pass-btn {
        color: #0083e3;
    }
    /* 键盘区 */
    .keyboard {
        display: flex;
        flex-wrap: wrap;
        margin-top: 65px;
        background: #fff;
        li {
        width: 33.3333%;
        height: 45px;
        padding-top: 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid #b2b2b2;
        border-right: 1px solid #b2b2b2;
        box-sizing: border-box;
        user-select: none;
          &:nth-child(3n) {
          border-right: 0;
          }
          &:active {
          background-color: #d1d5db;
          }
          .num {
          line-height: 1.2;
          font-size: 18px;
          }
          .character {
          line-height: 1.2;
          font-size: 12px;
          }
        }
        .zero {
          border-bottom: 0;
          line-height: 44px;
          font-size: 18px;
          padding: 0;
          }
        .none {
        border-bottom: 0;
        background: #d1d5db;
        }
        .delete {
        border-bottom: 0;
        &:active {
        border-bottom: 0;
        background-color: #fff;
        }
        }
    }
    /* 加载中 */
    .loading-wrap {
        position: absolute;
        left: 0;
        top: 40px;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        background: #fff;
        .loading {
        text-align: center;
          p {
          margin-top: 6px;
          }
          .loading-ico {
          animation: rotate 0.6s linear infinite;
          }
        }
    }
    @-webkit-keyframes rotate {
        0% {
            transform: rotate(0)
        }
        50% {
            transform: rotate(180deg)
        }
        100% {
            transform: rotate(360deg)
        }
    }
    @keyframes rotate {
        0% {
            transform: rotate(0)
        }
        50% {
            transform: rotate(180deg)
        }
        100% {
            transform: rotate(360deg)
        }
    }
    /* 支付失败弹窗 */
    .pay-fail {
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        max-width: 750px;
        background: rgba(0,0,0,.6);
        z-index: 999;
    }
    .pay-fail-lay {
        width: 60%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border-radius: 10px;
        overflow: hidden;
          .title {
          line-height: 30px;
          text-align: center;
          font-size: 16px;
          padding: 10px;
          }
          .btns {
          display: flex;
          border-top: 1px solid #f1f1f1;
            div {
            flex: 1;
            height: 40px;
            line-height: 40px;
            text-align: center;
              &:active {
                background: #f3f3f3;
              }
              &:last-child {
                border-left: 1px solid #f1f1f1;
              }
            }
          }
    }
</style>
