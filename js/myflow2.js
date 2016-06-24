$(document).ready(function(){
    var canvas = $('.flow');
    var paper = Raphael(canvas[0],canvas.width(), canvas.height()); // 这个是画板，定义为全局变量
    /*画线*/
    // var c = paper.path("M 400 10 L 200 200 ");
    
    // var circle = paper.circle(50, 100, 50);
    // // circle.drag(move, start, up);
    // /*画矩形*/
    // var rectangle = paper.rect(200, 200, 250, 100);
    // /*显示文字*/
    // circle.attr({"fill":"red"});
    // var t = paper.text(150, 150, "Hello world");
    // t.attr({"font-size":"30px","fill":"blue","stroke":"red","opacity":".5"});
    // /*制作动画*/
    // var circle = paper.circle(200, 150, 100);
    // circle.attr({"fill":"red"});
    // circle.animate({cx: 10, cy: 20, r: 8, "fill": "blue"}, 10e3);
    // /*绑定事件*/
    // var circle = paper.circle(600, 500, 100);
    // circle.attr({"fill":"red"});
    // circle.hover(function(){circle.attr({"fill":"green"});},function(){circle.attr({"fill":"red"});});

    /*定义一个集合，存放所有的画布上的元素*/
    var shapeArr = new Array();
    /*定义一个集合，存放点和线的信息*/
    var lineArr = new Array();
    //lineArr中的每个元素是一个线对象。
    var path = new Array(); // 0 spx 1 spy 2 epx 3 epy
    hander();
    /*定义一个颜色数组, 前面是画笔，后面的填充色*/
    var color = new Array("#E0F1D0","#03689a");
    /*文字集合*/
    var textArr = new Array();
    /*定义一个类型的枚举*/
    var TYPE = {
        "start":"circle",
        "state":"rect",
        "branch":"rhombus",
        "task":"rect",
        "end":"circle",    
   }
    /*写一个类，用来处理用户的各种事件*/
    /*可以使用观察者模式，来监听各种事件*/
    function hander(){
        var $drag = $('.drag div')
            ,type;
        /*为每个需要画的元素，绑定拖拽事件*/
        $drag.draggable({helper:'clone'});
        /*画布上的元素释放鼠标键之后，发生的事件*/
        $('.flow').droppable({
            drop:function(event,ui){
                /*获取鼠标的坐标*/
                var x = ui.offset.left
                    ,y = ui.offset.top;
                /*获取要画的形状*/
                type = $(ui.draggable[0]).find('span').attr('name');
                /*画出相应的图形*/
                console.log(TYPE[type])
                var s = shapeFactroy(x,y,TYPE[type],type);
                shapeArr.push(s);
            }
        });

        /*为连线按钮绑定事件*/
        window.isSelected=false;
        $('#conLine').bind('click',function(){
            /*将下面的选择的元素置为不可用*/
            // $drag.attr('disabled','false');
            // $drag.unbind();
            //为元素绑定clcik事件
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
                                /*判断线的起点和终点是否已经存在数组中了，如果存在，就不继续添加了*/
                                unfocusShape();
                                //让该元素的焦点，改变其外框的颜色
                                focusShape(shapeArr[i].re,shapeArr[i]);
                                var line = new Line(path[0],path[1]);
                                lineArr.push(line); //将线加入到数组中去
                            }else{
                                //这个是起点
                                path[0] = shapeArr[i];
                                //在这里这个的起点设置为true
                                window.isSelected = true;
                                //并让其他元素失去焦点
                                unfocusShape();
                                //让该元素的焦点，改变其外框的颜色
                                focusShape(shapeArr[i].re,shapeArr[i]);
                                
                            }
                        // });
                        console.log(this);
                    }
                }

                shapeArr[i].re.click(fun(i));
                $(shapeArr[i]).focus(function(event) {
                    /* Act on the event */
                    console.log(i);
                });

            }
            //下面这种方法也可以绑定事件，不过不是面向对象的思想
            // paper.forEach(function(event){
            //     /*先获取可以连线的元素，文本和线是不能连线的，基本的类型只有circle和rect了*/
            //     /*将所以的先保存到一个数组中每次发生改变时进行重绘*/
            //     if(event.type==='circle' || event.type==='rect'){
            //         //去掉元素的drag事件
            //         event.undrag();
            //         //这里的元素是raphael
            //         event.click(function(){
            //             /*先判断之前有没有选择一个元素，如果选择了一个元素，那么这个就是终点，如果没有选择元素，这个元素就是起点*/
            //             /*根据这个，可以想到，每个circle和rect类型的元素，需要有一个是否是起点的属性isOrigin,*/
            //             if(window.isSelected){
            //                 //这里是终点
            //                 path[1] = event;
            //                 window.isSelected = false;
            //                 /*在这里画线*/
            //                 var line = new Line(path[0],path[1]);
            //                 lineArr.push(line); //将线加入到数组中去
            //             }else{
            //                 //这个是起点
            //                 path[0] = event;
            //                 //在这里这个的起点设置为true
            //                 window.isSelected = true;
            //             }
            //         });
            //     }
            // });

            
        })
        $('#selectEle').bind('click', function(event) {
            /*如果现在了选择按钮，表示可以拖拽面板中的对象*/
            /*首要要解除面板上的绑定的点击事件*/

             for(var i = 0;i < shapeArr.length;i ++){
                shapeArr[i].re.unclick();
                shapeArr[i].drag();//绑定拖拽事件
                //重新绑定click事件，这个click事件是可以获取元素的焦点，并获取该元素的信息
                var fun = function(i){
                    return function(){
                        unfocusShape();
                        focusShape(shapeArr[i].re,shapeArr[i]);
                    }
                }
                shapeArr[i].re.click(fun(i));
             }
             //拖拽的时候，要重绘线，让线跟着跑
            //取出存放先的数组
            for(var i = 0;i < lineArr.length; i ++){
                //重新绘制线
                var fun = function(i){
                    return function(){
                        lineArr[i].run();
                    }
                }
                window.setInterval(fun(i),50);
            }

            for(var i = 0;i < textArr.length;i ++){
                var fun = function(i){
                    return function(){
                        textArr[i].run();
                    }
                }
                window.setInterval(fun(i),50);
            }
        });
    }
    //首先移除所有元素的焦点
    function unfocusShape(){
        for(var j = 0;j < shapeArr.length;j++){
            shapeArr[j].re.attr({
                stroke: "#03689a",
                'stroke-stroke': '1px'
            });
        }
    }
    //将点击的元素获取焦点，传递的类型是raphael类的类型
    function focusShape(data,ele){
        data.attr({ 
            stroke: "#ff3300" , 
            'stroke-stroke': '2px'
        });

        //显示该元素的属性框
        var html = '<div class="content">'
                    +'<h4>属性</h4>'
                    +'<div class="form">'
                        +'<div>'
                            +'<label for="name">显示</label>'
                            +'<input class="span2" type="text" id="name" value="'+ele.getName()+'"/>'
                        +'</div>'
                        +'<div>'
                            +'<label for="description">描述</label>'
                            +'<textarea class="span2" name="description" id="description" cols="20" rows="2">'+ele.getDescription()+'</textarea>'
                        +'</div>'
                        +'<div class="butt">'
                            +'<input type="button" class="btn btn-success" id="confirm" value="确定"/>'
                            +'<input type="button" class="btn" id="cancle" value="取消"/>'
                        +'</div>'
                        +'<div class="butt">'
                            +'<input type="button" class="btn btn-danger span2" id="delete" value="删除此元素"/>'
                        +'</div>'
                    +'</div>'
                +'</div>';

        $('body').append(html);
    }


    function shapeFactroy(x,y,type,name){
        var oReturn  = null;
        if(type == 'circle'){
            oReturn = new Circle(x,y,type,name);
            
        }else if(type =='rect'){
            oReturn = new Rect(x,y,type,name);
        }else if(type == 'rhombus'){
            oReturn = new Rhombus(x,y,type,name);
        }
        // oReturn.getRe().drag();
        var t = new Text(oReturn);
        textArr.push(t);
        return oReturn;
    }

    /*设计一个类，实现各种不同的形状的画图,这是一个抽象类*/
    function Shape(x,y,type,name){
        //形状的特性     
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = color[0];
        this.fillcolor = color[1];
        this.re = null;
        // this.text = null; //每一个形状应该有一个对应的文字的

        this.name = name;
        this.description = name;

        this.getContent = function(){
            // return 
        }
        // this.isOrigin = false; //刚开始每个元素都不是起点 这个是画面元素的属性，所以在各个构造函数中赋值

        /*创建图形的工厂方法,每个子类都要重写这个方法*/
        this.createShape = function(){};
        this.getRe = function(){
            return this.re;
        }
        //为元素绑定点击获取焦点的事件

        //为元素绑定拖拽事件
        ///*为每个画布上的元素默认绑定鼠标点击拖拽事件*/
        this.drag = function(){
            this.re.drag(this.move,this.start,this.up);

        }

        //每个形状都有可以拖拽的属性
        this.start = function (x, y,event) {
            //这里要设置并记录开始执行是的一些样式，位置等信息
            //根据对象的类型来获取位置, 这个位置是开始的位置
            if(type==='circle'){
                this.deltaX = this.attrs.cx;
                this.deltaY = this.attrs.cy;
            }else{
                this.deltaX = this.attrs.x;
                this.deltaY = this.attrs.y;
            }
            //

        }
        this.move = function (dx, dy, x, y) {
            //因为菱形的移动和鼠标x，y不同，所有要分别判断
            // console.log(dx+","+dy+": " + x + ","+ y);
            if(type === 'rhombus'){
                // console.log(this.ox);
                this.attr({
                    x: (dy-dx)/Math.SQRT2+Math.SQRT2*dx+this.deltaX,
                    y: (dy-dx)/Math.SQRT2+this.deltaY
                });
            }else if(type==='circle'){
                this.attr({
                    cx:dx+this.deltaX,
                    cy:dy+this.deltaY
                });
                console.log(this.attrs.cx + "," + this.attrs.cy);
            }else if(type==='rect'){
                this.attr({
                    x : dx +this.deltaX,
                    y : dy + this.deltaY
                });
            }
            unfocusShape();
            // focusShape(this);

        },
        this.up = function(){
            this.animate();
        }; 

        /*有一个函数要能设置和获取的值isOrigin*/
        this.setIsOrigin = function(data){
            if(this.re){
                this.re.isOrigin = data;
            }
        }
        this.getIsOrigin = function(){
            return this.re.isOrigin;
        }
        /*每个类重写该方法*/
        this.getX = function(){};
        this.getY = function(){};
        /*setX和setY暂时不能用*/
        this.setX = function(X){};
        this.setY = function(Y){};

        this.setName = function(name){
            this.name = name;
        }
        this.getName = function(){
            return this.name;
        }
        this.setDescription = function(description){
            this.description = description;
        }
        this.getDescription = function(){
            return this.description;
        }
    }

    /*圆形继承自形状*/
    function Circle(x,y,type,name){
        Shape.call(this,x,y,type,name);
        /*下面这个是构造函数*/
        this.createShape = function(type){
            if(name==='start'){
                this.name="开始";
            }else if(name==='end'){
                this.name="结束";                
            }
            this.description = this.name;
            this.re = paper.circle(x,y,30);
            this.setIsOrigin(false);
            this.re.attr({fill: '#E0F1D0', stroke: "#03689a", cursor: "move"});
            // paper.text(x,y,this.name).attr({cursor:'pointer'});
            this.re.drag(this.move,this.start,this.up);
        }
        this.createShape();
        this.getX = function(){
            return this.re.attrs.cx;
        }
        this.getY = function(){
            return this.re.attrs.cy;
        }
        this.setX = function(X){
            this.re.attr({cx:X});
        }
        this.setY = function(Y){
            this.re.attr({cy:Y});
        }
    }

    /*矩形类继承自形状*/
    function Rect(x,y,type,name){
        Shape.call(this,x,y,type,name);
        this.createShape = function(type){
            if(name==='state'){
                this.name="状态";
            }else if(name==='task'){
                this.name="任务";
            }
            this.description = this.name;
            this.re = paper.rect(x,y,50,50);
            this.re.attr({fill: '#E0F1D0', stroke: "#03689a", cursor: "move"});
            // paper.text(x,y,this.name).attr({cursor:'pointer'});
            this.drag();
        }
        this.createShape();
        this.getX = function(){
            return this.re.attrs.x;
        }
        this.getY = function(){
            return this.re.attrs.y;
        }
    }
    /*菱形类继承系形状*/
    function Rhombus(x,y,type,name){
        Shape.call(this,x,y,type,name);
        that = this;
        this.createShape = function(type){
            this.name="选择";
            this.description = this.name;
            this.re = paper.rect(x,y,50,50,5);
            this.re.attr({fill: '#E0F1D0', stroke: "#03689a", cursor: "move"});
            // paper.text(x,y,this.name).attr({cursor:'pointer'});
            this.re.rotate(45);
            this.drag();
        }
        this.createShape();
        this.getX = function(){
            return this.re.attrs.x;
        }
        this.getY = function(){
            return this.re.attrs.y;
        }
    }

    function Text(shape){
        this.shape = shape;
        this.x = shape.getX();
        this.y = shape.getY();
        this.text = shape.getName();
        this.re = null;
        this.createShape = function(){
            this.x =  shape.getX();
            this.y = shape.getY();
            if(this.re){
                this.re.remove();
                this.re = null;
            }
            this.re = paper.text(this.x,this.y,this.text).attr({cursor:'pointer'});
        }
        this.createShape();
        this.run = function run(){
            if(shape.getX() !== this.x || shape.getY() !== this.y){
                this.createShape();
            }
        }
    }

    /*线类型，要包含起点这终点，这个是shape类型的组合*/
    function Line(shapeS,shapeE){
        this.shapeS = shapeS;
        this.shapeE = shapeE;
        this.spx = shapeS.getX();
        this.spy = shapeS.getY();
        this.epx = shapeE.getX();
        this.epy = shapeE.getY();
        this.re = null;
        /*构造函数*/
        this.createShape = function(){
            this.spx = shapeS.getX();
            this.spy = shapeS.getY();
            this.epx = shapeE.getX();
            this.epy = shapeE.getY();
            if(this.re){
                this.re.remove();
                this.re = null;
            }
            console.log("M "+ this.spx + " " +this.spy + " L " + this.epx +" "+ this.epy);
            this.re = paper.path("M "+ this.spx + " " + this.spy + " L " + this.epx +" "+ this.epy);
            this.re.attr({'stroke':'#808080','arrow-end': 'block-wide-long', 'stroke-width': '2px'});
        }
        this.createShape();

        this.getStartPoint = function(){
            return [this.spx,this.spy];
        }

        this.getEndPoint = function(){
            return [this.epx,this.epy];
        }

        /*让线也可以拖动起来*/
        //每个形状都有可以拖拽的属性
        this.start = function (x, y) {
            // this.spX = this.attrs.path[0][1];
            // this.spY = this.attrs.path[0][2];
            // this.epX = this.attrs.path[1][1];
            // this.epY = this.attrs.path[1][2];
            this.deltaX = this.attrs.x;
            this.deltaY = this.attrs.y;
        }
        this.move = function (dx, dy, x, y) {

            console.log(dx+","+dy+": " + x + ","+ y);
            //线动的条件是
            var x = this.deltaX + dx,
                y = this.deltaY + dy;
            this.attr({
                x: x,
                y: y
            });
            
        },
        this.up = function () {
            this.animate();
        }; 

        this.drag = function(){
            this.re.drag(this.move,this.start,this.up);
        }
        /*每条线要有一个监听的函数，如果起点，或者终点发生变化，就重绘该线*/
        this.run = function run(){
            if(shapeS.getX() !== this.spx || shapeS.getY() !== this.spy || shapeE.getX() !== this.epx || shapeE.getY() !== this.epy){
                //创建新线的时候，要把之前的线删除
                this.createShape();
                // this.re.drag(this.move,this.start,this.up);
                // console.log(this);
                //方案二，就是拖动该线
                
            }
        }
    }
});
