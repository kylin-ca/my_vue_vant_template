export const cookie = {
  setCookie(name, value, expiresHours, path) {
    let cookieString = name + "=" + escape(value);
    if (expiresHours === Infinity) {
      cookieString = cookieString + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    } else {
      //判断是否设置过期时间
      if (expiresHours > 0) {
        // debugger;
        var date = new Date();
        date.setTime(date.getTime() + expiresHours * 60 * 60 * 1000);
        cookieString = cookieString + "; expires=" + date.toGMTString();
      }
    }
    // 为了防止cookie重复
    if (!path) {
      cookieString = cookieString + "; path=/";
    } else {
      cookieString = cookieString + "; path=" + path;
    }
    document.cookie = cookieString;
  },
  getCookie(name) {
    const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
    const arr = document.cookie.match(reg);
    if (arr) {
      return decodeURIComponent(arr[2]);
    } else {
      return null;
    }
  },
  delCookie({
    name,
    domain,
    path
  }) {
    if (getCookie(name)) {
      document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT'
    }
  }
};

export const localStorage = {
  /**
   * 获取缓存对象
   * @param {*} key 
   */
  get(key) {
    var cache = window.localStorage.getItem(key);
    if (cache == null) return null;
    try {
      return JSON.parse(cache);
    } catch (e) {
      return cache;
    }
  },
  /**
   * 设置缓存
   * @param {*} key 
   * @param {*} data 
   */
  set(key, data) {
    if (data == null || typeof data === 'string') {
      window.localStorage.setItem(key, data);
    } else {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  },
  del(key){
    window.localStorage.removeItem(key);
  }
}

