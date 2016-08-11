1. 遇到的问题：在循环绑定事件的时候，始终指向最后一个对象的值

问题原因：主要是闭包导致的错误
解决方案：使用匿名函数来解决这个问题
for(var i = 0;i < shapeArr.length;i ++){
    //去掉元素的drag事件
    shapeArr[i].re.undrag();
    //这里的元素是raphael
    // that = shape;
    //使用匿名函数，解决闭包问题
    var fun = function(i){
        return function(){
            // shapeArr[i].re.click(function(){
                /*先判断之前有没有选择一个元素，如果选择了一个元素，那么这个就是终点，如果没有选择元素，这个元素就是起点*/
                /*根据这个，可以想到，每个circle和rect类型的元素，需要有一个是否是起点的属性isOrigin,*/
                if(window.isSelected){
                    //这里是终点
                    path[1] = shapeArr[i];
                    window.isSelected = false;
                    /*在这里画线*/
                    var line = new Line(path[0],path[1]);
                    lineArr.push(line); //将线加入到数组中去
                }else{
                    //这个是起点
                    path[0] = shapeArr[i];
                    //在这里这个的起点设置为true
                    window.isSelected = true;
                }
            // });
        }
    }
    shapeArr[i].re.click(fun(i));
}

2. 作用域调用的问题


3. 清除线的问题


4. 版本2可以实现，但是动画会出现卡顿

5. 该项目让我深刻理解闭包，以及在循环中调用闭包会出现的问题

6. $("#textarea").val();  这个是用来取textarea的值的、

7. 版本5中，基本功能可以实现

8. 版本6中，添加文本框，和将线折断的功能


