import axios from 'axios'
import router from '../router'
// import qs from 'qs'
import lodash from 'lodash'
import {
  cookie
} from './cookie'
const {
  setCookie,
  getCookie,
  delCookie,
} = cookie;
import {
  Toast
} from "vant";
import {
  getRefreshToken,
  getWeChatUrl
} from '../services/token'
// const { pathToRegexp, match, parse, compile } = require("path-to-regexp");

// 是否正在刷新token的标记
let isRefreshing = false
// 重试队列，每一项将是一个待执行的函数形式
let requests = []

const fetch = (options) => {
  let {
    method = 'get',
    data,
    fetchType,
    url,
    headers,
    noToken
  } = options
  //header塞token
  !noToken ? options.headers = {
    Authorization: `Bearer ${getCookie('access_token')}`,
    ...headers
  } : options.headers = {}
  // const cloneData = lodash.cloneDeep(data)
  const cloneData = data
  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(url, {
        headers: options.headers,
        params: cloneData,
      }, {
        headers: options.headers
      })
    case 'delete':
      return axios.delete(url, {
        headers: options.headers,
        data: cloneData,
      })
    case 'post':
      return axios.post(url, cloneData, {
        headers: options.headers
      })
    case 'put':
      return axios.put(url, cloneData)
    case 'patch':
      return axios.patch(url, cloneData)
    default:
      return axios(options)
  }
}

export default function request(options) {
  return fetch(options).then((response) => {
    const {
      statusText,
      status
    } = response
    let data = response.data
    if (+data.code === 100003) {
      router.push('/NoAccess')
    }
    if (data.code && data.code !== 200 && !options.noToast) {
      Toast(data.msg);
      Promise.reject(data.msg)
    }
    if (data.extMsg && data.extMsg.length) {
      Toast(data.extMsg[0]);
    }
    return {
      success: true,
      message: statusText,
      status,
      ...data,
    }
  }).catch((error) => {
    console.log(error.response)
    const {
      response
    } = error
    let msg
    let status
    let otherData = {}
    if (response) {
      const {
        data,
        statusText,
        config
      } = response
      otherData = data
      status = response.status
      msg = data.message || statusText
      if (status == 401) {
        if (!isRefreshing) {
          isRefreshing = true
          let refresh_token = getCookie('refresh_token')
          return getRefreshToken({
            refreshToken: refresh_token
          }).then(res => {
            if (res.code == 200) {
              const {
                access_token,
                refresh_token,
                username
              } = res.data
              setCookie('access_token', access_token, 24 * 7)
              setCookie('refresh_token', refresh_token, 24 * 30)
              setCookie('accountName', username, 24 * 7)
              config.headers['Authorization'] = `Bearer ${access_token}`
              // config.baseURL = ''
              // 已经刷新了token，将所有队列中的请求进行重试
              requests.forEach(cb => cb(access_token))
              requests = []
              return axios(config)
            } else {
              getWeChatUrl({
                redirectUri: window.location.href
              }).then((res) => {
                if (res.code == 200) {
                  const {
                    weChatUri
                  } = res.data
                  delCookie({
                    name: 'access_token'
                  });
                  delCookie({
                    name: 'refresh_token'
                  });
                  delCookie({
                    name: 'accountName'
                  });
                  setTimeout(() => {
                    window.location.href = weChatUri
                  }, 10);
                }
              }).catch((error) => {
                Toast({
                  message: error.msg,
                  forbidClick: true,
                  onClose: function () {
                    router.push({
                      name: 'error'
                    })
                  }
                });
              })
            }
          }).catch(res => {
            console.error('refreshtoken error =>', res)

          }).finally(() => {
            isRefreshing = false
          })
        } else {
          // 正在刷新token，将返回一个未执行resolve的promise
          return new Promise((resolve) => {
            // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
            requests.push((access_token) => {
              // config.baseURL = ''
              config.headers['Authorization'] = `Bearer ${access_token}`
              resolve(axios(config))
            })
          })
        }
      } else {
        Toast(error.message);
        return;
      }
    } else {
      status = 600
      msg = 'Network Error'
    }
    return {
      success: false,
      status,
      message: msg,
      ...otherData
    }
  })
}