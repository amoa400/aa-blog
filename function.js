function Func() {
}
export default new Func();

// 是否在数组中
Func.prototype.inArray = function(data, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (data === arr[i])
      return true;
  }
  return false;
}

// 执行一个生成器函数
Func.prototype.run = function() {
  // 获取参数
  var fn = arguments[0];
  var arg = [];
  for (var i in arguments) {
    if (i === '0') continue;
    arg.push(arguments[i]);
  }
  arg.push(resume);

  // 恢复函数
  function resume() {
    var arg = arguments;
    process.nextTick(function() {
      genObj.next(arg);
    });
  }

  // 执行函数
  var genObj = fn.apply(this, arg);
  genObj.next();
}

// 获取当前时间
Func.prototype.getTime = function() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  if (month < 10)
    month = '0' + month;
  if (day < 10)
    day = '0' + day;
  if (hour < 10)
    hour = '0' + hour;
  if (minute < 10)
    minute = '0' + minute;
  if (second < 10)
    second = '0' + second;
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

// 获取当前时间
Func.prototype.getStamp = function() {
  return parseInt((new Date()).getTime() / 1000);
}
