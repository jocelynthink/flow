$(document).ready(function(){
    var canvas = $('.flow');
    var paper = Raphael(canvas[0],canvas.width(), canvas.height()); // 这个是画板，定义为全局变量
    // var circle = paper.circle(50, 100, 50);
    // circle.attr({"fill":"red"});
    // /*画矩形*/
    // var rectangle = paper.rect(200, 200, 250, 100);
     /*定义一个类型的枚举*/
     var TYPE = {
         "start" : "circle",
         "state" : "rect",
         "branch" : "rhombus",
         "task" : "rect",
         "end" : "circle", 
         "text" : "text"  
    }
    /*定义一个集合，存放所有的画布上的元素*/
    var shapeArr = new Array();
    var path = new Array(); // 0 spx 1 spy 2 epx 3 epy
    var pathArr = new Array();
    var $drag = $('.drag div')
        ,type;
    /*为每个需要画的元素，绑定拖拽事件*/
    $drag.draggable({helper:'clone'});
    /*画布上的元素释放鼠标键之后，发生的事件*/
    $('.flow').droppable({
        drop:function(event,ui){
            /*获取鼠标的坐标*/
            var x = ui.offset.left,
                y = ui.offset.top;

            // var x = event.screenX,
            //     y = event.screenY;
            /*获取要画的形状*/
            type = $(ui.draggable[0]).find('span').attr('name');
            /*画出相应的图形*/
            console.log(TYPE[type])
            var s = shapeFactroy(x,y,TYPE[type],type);
            s[0].createShape();
            /*在这里添加鼠标点击事件*/

            s[0].re.click(function(){
                s[0].unfocus();
                s[0].re.attr({
                        stroke: 'red',
                        'stroke-stroke': '2px'
                    });
                s[0].showDescription();
            });
        }
    });
    window.isSelected = false;
    $('#conLine').bind('click',function(){
        $('.handle h4').html('状态：连线中');
        window.isLineCon = true;
        for (var i = 0 ; i < shapeArr.length ; i ++){
            //使用匿名函数，解决闭包问题
            var fun = function(i){
                return function(){
                        /*先判断之前有没有选择一个元素，如果选择了一个元素，那么这个就是终点，如果没有选择元素，这个元素就是起点*/
                    if(window.isLineCon){
                        if(window.isSelected){
                            //这里是终点
                            path[1] = shapeArr[i];
                            window.isSelected = false;
                            shapeArr[i].unfocus();
                            this.attr({
                                stroke: 'red',
                                'stroke-stroke': '2px'
                            });
                            shapeArr[i].showDescription();   
                            /*判断是否创建新线*/
                            if(path[0]===path[1] || isPathExist(path[0],path[1])){//如果先之前存在，则不在创建//起点和终点相同
                                //什么也不做
                            }else{
                                var line = new Line(path[0],path[1],1);
                                line.createShape();
                                pathArr.push([ path[0],path[1],line]);

                                console.log(pathArr);
                                // lineArr.push(line); //将线加入到数组中去
                                var fun = function(line){
                                    return function(){
                                        line.run();
                                    }
                                }
                                line.timer = window.setInterval(fun(line),50);
                            }

                        }else{
                            //这个是起点
                            path[0] = shapeArr[i];
                            //在这里这个的起点设置为true
                            window.isSelected = true; 
                            shapeArr[i].unfocus();
                            this.attr({
                                stroke: 'red',
                                'stroke-stroke': '2px'
                            });
                            shapeArr[i].showDescription();                     
                        }
                    }
                }
            }
            shapeArr[i].re.click(fun(i));
        }
    });
    /*写一个类，用来处理用户的各种事件*/
    /*可以，来监听各种事件*/
    // $('svg').bind('click',function(event){
    //     console.log(event);
    //     console.log(event.target);
    //     console.log(event.target.nodeName);
    //     if(event.target.nodeName==='circle'){
    //         // $(this).draggable();
    //         // $(event.target).draggable();
    //     }
    // });

    $('#selectEle').bind('click', function(event){
        $('.handle h4').html('状态：选择元素');
        window.isLineCon = false;
        //只绑定焦点事件
        for(var i = 0;i < shapeArr.length;i ++){
            //重新绑定click事件，这个click事件是可以获取元素的焦点，并获取该元素的信息
            var fun = function(i){
                return function(){
                    shapeArr[i].unfocus();
                    shapeArr[i].re.attr({
                            stroke: 'red',
                            'stroke-stroke': '2px'
                        });
                   shapeArr[i].showDescription();
                }
            }
            shapeArr[i].re.click(fun(i));

        }
    });

    function isPathExist(path1,path2){
        for(var i=0;i <pathArr.length;i++){
            if(pathArr[i][0]===path1 && pathArr[i][1]===path2){
                return true;
            }
        }
        return false;
    }
    function shapeFactroy(x,y,type,name,size){
        var oReturn  = null,tempName;
        if(type == 'circle'){
            if(name==='start'){
                tempName="开始";
            }else if(name==='end'){
                tempName="结束";                
            }else if(name==='dot'){
                tempName="";
            }
            oReturn = new Circle(x,y,type,tempName,size);
        }else if(type =='rect'){
            if(name==='state'){
                tempName="状态";
            }else if(name==='task'){
                tempName="任务";
            }          
            oReturn = new Rect(x,y,type,tempName);
        }else if(type == 'rhombus'){
            tempName="分支";
            oReturn = new Rhombus(x,y,type,tempName);
        }else if(type=='text'){

            tempName= name!=='text' ? name : "请输入文字";
            oReturn = new Text(x,y,type,tempName);
        }
        shapeArr.push(oReturn);
        
        return [oReturn,tempName];
    }

    function Shape(x,y,type,name,size){
        //形状的特性     
        this.x = x;
        this.y = y;
        this.type = type;
        this.name = name;
        this.description = name;
        this.re = null;
        this.text = null;
    }
    Object.defineProperty(Shape.prototype,"constructor",{
        enumerable:false,
        value:Shape
    });
    Shape.prototype = {
        createShape:function(){},
        start:function(){
            if(this.type==='circle'){
                this.deltaX = this.attrs.cx;
                this.deltaY = this.attrs.cy;
            }else{
                this.deltaX = this.attrs.x;
                this.deltaY = this.attrs.y;
            }
            if(this.text){
                this.text.textX = this.text.attrs.x;
                this.text.textY = this.text.attrs.y;
            }
        },
        move:function(dx,dy,x,y){
            if(this.type === 'rhombus'){
                this.attr({
                    x: (dy-dx)/Math.SQRT2+Math.SQRT2*dx+this.deltaX,
                    y: (dy-dx)/Math.SQRT2+this.deltaY
                });
            }else if(this.type==='circle'){
                this.attr({
                    cx:dx+this.deltaX,
                    cy:dy+this.deltaY
                });
                console.log(this.attrs.cx + "," + this.attrs.cy);
            }else{
                this.attr({
                    x : dx +this.deltaX,
                    y : dy + this.deltaY
                });
            }
            if(this.text){
                this.text.attr({
                    x: dx + this.text.textX,
                    y: dy + this.text.textY
                });
            }
        },
        up:function(){
            this.animate();
        },
        reSet:function(){
            this.re.type=this.type;
            this.re.text = this.text;

        },
        unfocus:function(){
            paper.forEach(function(event){
                /*先获取可以连线的元素，文本和线是不能连线的，基本的类型只有circle和rect了*/
                /*将所以的先保存到一个数组中每次发生改变时进行重绘*/
                if(event.type==='circle' || event.type==='rect' || event.type==='rhombus'){
                    event.attr({
                        stroke: "#03689a",
                        'stroke-stroke': '1px'
                    });
                }
            });
        },
        showDescription:function(){
            that = this;
            /*去掉之前的*/
            $('.content').remove();
            var html;
            if(this.type=='text'){
                html = '<div class="content">'
                        +'<h4>属性</h4>'
                        +'<div class="form">'
                            +'<div>'
                                +'<label for="name">显示</label>'
                                +'<input class="span2" type="text" id="name" value="'+this.name+'"/>'
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
                $('.content #delete').unbind('click',null);
                $('.content #delete').bind('click',function(){
                    // if(confirm('删除此项后将删除该项的所有相关事物\n\n是否确定删除？')){
                        that.re.remove();
                        console.log("delete");
                        $('.content').remove();
                    // }
                });
                $('.content #confirm').unbind('click',null);
                $('.content #confirm').bind('click',function(){
                    //更新元素
                    var temp = $('.content #name').val();
                    if(that.name != temp){
                        /*重绘字的画笔*/
                        that.name = temp;
                        var x = that.getX(),
                            y = that.getY();
                        that.re.remove();
                        var temp = new shapeFactroy(x,y,'text',that.name);
                        temp[0].createShape();
                        // that.re = paper.text(x,y,that.name).attr({cursor:'pointer'});
                        temp[0].re.click(function(){
                            temp[0].unfocus();
                            temp[0].re.attr({
                                    stroke: 'red',
                                    'stroke-stroke': '2px'
                                });
                            temp[0].showDescription();
                        });
                        

                    } 
                });
                $('.content #cancle').unbind('click',null);
                $('.content #cancle').bind('click',function(){
                    //取消               
                    $('.content #name').val(that.name);
                });

            }else{
                html = '<div class="content">'
                            +'<h4>属性</h4>'
                            +'<div class="form">'
                                +'<div>'
                                    +'<label for="name">显示</label>'
                                    +'<input class="span2" type="text" id="name" value="'+this.name+'"/>'
                                +'</div>'
                                +'<div>'
                                    +'<label for="description">描述</label>'
                                    +'<textarea class="span2" name="description" id="description" cols="20" rows="2">'+this.description+'</textarea>'
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
                $('.content #delete').unbind('click',null);
                $('.content #delete').bind('click',function(){
                    // var temp = confirm('删除此项后将删除该项的所有相关事物\n\n是否确定删除');
                    // if(temp==true){
                        that.re.remove();
                        if(that.text){

                            that.text.remove();
                        }
                        console.log("delete");
                        $('.content').remove();
                        /*删除此元素关联的线*/
                        for(var i = 0;i < pathArr.length ; i++){
                            if(pathArr[i][0] === that || pathArr[i][1] === that){
                                pathArr[i][2].re.remove();
                                /*并清除改线对应的计数器*/
                                window.clearInterval(pathArr[i][2].timer);
                            }
                        }
                    // }else{
                    //     console.log(temp);
                    // }
                });
                $('.content #confirm').unbind('click',null);
                $('.content #confirm').bind('click',function(){
                    //更新元素
                    var temp = $('.content #name').val();
                    if(that.name != temp){
                        /*重绘字的画笔*/
                        that.name = temp;
                        that.re.text.remove();
                        that.re.text = paper.text(that.getX(),that.getY(),that.name).attr({cursor:'pointer'});
                        that.text = that.re.text;
                    } 
                    that.description = $(".content #description").val();
                    console.log(that.name + " , "+ that.description);
                });
                $('.content #cancle').unbind('click',null);
                $('.content #cancle').bind('click',function(){
                    //取消               
                    $('.content #name').val(that.name);
                    $(".content #description").val(that.description);
                    console.log(that.name + " , "+ that.description);
                });
            }
        },
        getX:function(){},
        getY:function(){},   
    }

     /*圆形类继承自形状*/
    function Circle(x,y,type,name,size){
        //集成属性
        Shape.call(this,x,y,type,name);
        this.size = size || 30;
    }
    //集成方法
    Circle.prototype = new Shape();
    Circle.prototype.constructor = Circle;
    Circle.prototype.createShape = function(){
        this.re = paper.circle(this.x,this.y,this.size).attr({fill: '#E0F1D0', stroke: "#03689a", cursor: "move"});
        this.text = paper.text(this.x,this.y,this.name).attr({cursor:'pointer'});
        this.reSet();
        this.re.drag(this.move,this.start,this.up);
        that = this;
        this.re.click(function(event) {
            // that.unfocus();
            // this.attr({
            //     stroke: 'red',
            //     'stroke-stroke': '2px'
            // });
            // that.showDescription();
        });
    }
    Circle.prototype.getX = function(){
        return this.re.attrs.cx;
    }
    Circle.prototype.getY = function(){
        return this.re.attrs.cy;
    }

    /*矩形继承自形状*/
    function Rect(x,y,type,name){
        //集成属性
        Shape.call(this,x,y,type,name);
    }
    //集成方法
    Rect.prototype = new Shape();
    Rect.prototype.constructor = Rect;
    Rect.prototype.createShape = function(){
        this.re = paper.rect(this.x,this.y,100,50).attr({fill: '#E0F1D0', stroke: "#03689a", cursor: "move"});
        this.text = paper.text(this.x,this.y,this.name).attr({cursor:'pointer'});
        this.reSet();
        this.re.drag(this.move,this.start,this.up);
        that = this;
        // this.re.click(function(event) {
        //     that.unfocus();
        //     this.attr({
        //         stroke: 'red',
        //         'stroke-stroke': '2px'
        //     });
        //     that.showDescription();
        // });
    };
    Rect.prototype.getX = function(){
        return this.re.attrs.x;
    };
    Rect.prototype.getY = function(){
        return this.re.attrs.y;
    }

    /*菱形类继承自形状*/
    function Rhombus(x,y,type,name){
        Shape.call(this,x,y,type,name);
    }
    Rhombus.prototype = new Shape();
    Rhombus.prototype.constructor = Rhombus;
    Rhombus.prototype.createShape = function(){
        this.re = paper.rect(this.x,this.y,50,50,5).attr({fill: '#E0F1D0', stroke: "#03689a", cursor: "move"});
        this.re.rotate(45);
        this.text = paper.text(this.x,this.y,this.name).attr({cursor:'pointer'});
        this.reSet();
        this.re.drag(this.move,this.start,this.up);
        // that = this;
        // this.re.click(function(event) {
        //     that.unfocus();
        //     this.attr({
        //         stroke: 'red',
        //         'stroke-stroke': '2px'
        //     });
        //     that.showDescription();
        // });
    }
    Rhombus.prototype.getX = function(){
        return this.re.attrs.x;
    }
    Rhombus.prototype.getY = function(){
        return this.re.attrs.y;
    }

    /*画文字的类*/
    function Text(x,y,type,name){     
        Shape.call(this,x,y,type,name);
    }
    Text.prototype = new Shape();
    Text.prototype.constructor = Text;
    Text.prototype.createShape = function(){      
        this.re = paper.text(this.x,this.y,this.name).attr({cursor:'move'});
        this.re.drag(this.move,this.start,this.up);
        console.log(this.re);
    }
    Text.prototype.getX = function(){
        return this.re.attrs.x;
    };
    Text.prototype.getY = function(){
        return this.re.attrs.y;
    }

    /*线类型，要包含起点这终点，这个是shape类型的组合*/
    function Line(shapeS,shapeE,type){
        this.shapeS = shapeS;
        this.shapeE = shapeE;
        this.spx = shapeS.getX();
        this.spy = shapeS.getY();
        this.epx = shapeE.getX();
        this.epy = shapeE.getY();
        this.re = null;
        this.timer = null;
        this.mid = null;
        this.type = type; //1 表示右箭头，0表示没有箭头
    }

    Line.prototype  = {
        createShape: function(){
            this.spx = this.shapeS.getX();
            this.spy = this.shapeS.getY();
            this.epx = this.shapeE.getX();
            this.epy = this.shapeE.getY();
            if(this.re){
                this.re.remove();
                this.re = null;
            }
            console.log("M "+ this.spx + " " +this.spy + " L " + this.epx +" "+ this.epy);
            this.re = paper.path("M "+ this.spx + " " + this.spy + " L " + this.epx +" "+ this.epy);
            if(this.type===1){
                this.re.attr({'stroke':'#808080','arrow-end': 'classic-wide-long', 'stroke-width': '3px'});
            }else if(this.type===0){
                this.re.attr({'stroke':'#808080','stroke-width': '3px'});
            }
            this.re.shapex = this.shapeS;
            this.re.shapey = this.shapeE;
            that = this;
            this.re.click(function(event,that) {
                /* Act on the event */
                console.log(event);
                console.log(this);
                console.log(this.id);
                myline = paper.getById(this.id)[0];//转换为DOM对象
                var mypath = new Array();
                mypath = $(myline).attr('d').split('L');
                mypath[0] = mypath[0].split('M')[1]; //path[0]起点  path[1]终点
                //现在分成两条线
                //先把当前的线去掉
                // mypath[2] = 

                //在当前这个位置生成一个点
                var mid = new shapeFactroy(event.offsetX,event.offsetY,'circle','dot',5);
                mid[0].createShape();
                //建立两条线
                var line1 = new Line(this.shapex,mid[0],0);
                line1.createShape();
                var line2 = new Line(mid[0],this.shapey,1);
                line2.createShape();
                pathArr.push([this.shapex,mid[0],line1]);
                pathArr.push([mid[1],this.shapey,line2]);

                console.log(pathArr);
                // lineArr.push(line); //将线加入到数组中去
                var fun = function(line){
                    return function(){
                        line.run();
                    }
                }
                line1.timer = window.setInterval(fun(line1),50);
                line2.timer = window.setInterval(fun(line2),50);
                this.remove();
                // this.mid = paper.circle(event.offsetX,event.offsetY,5).attr({"fill":"red"});
                //获取当前点的x，y坐标，并将线分割成两条
                
                //以当前点击的位置为轴，可以拖拽该线
                //在当前位置拖拽线，
            });
            // this.re.drag(this.move,this.start,this.up);
        },
       start : function (x, y) {
          // this.attr({opacity: 1});
          this.lastX = x;
          this.lastY = y;
        },
        move : function (dx, dy, x, y) {
          var deltaX = x - this.lastX;
          var deltaY = y - this.lastY;
          this.translate(deltaX, deltaY);
          this.lastX = x;
          this.lastY = y;
          console.log(this);
          console.log(this.attrs.path[0])
          console.log(this.attrs.path[0][1] + ","+ this.attrs.path[0][2]);
          console.log(this.attrs.d);
        },
        up : function () {
          // this.attr({opacity: 0.8});
          // this.attr({
          //     path[0]: ['M',100,100],
          //     path[1]: ['L',300,200]
          // });
        },
        run:function(){
            if(this.shapeS.getX() !== this.spx || this.shapeS.getY() !== this.spy || this.shapeE.getX() !== this.epx || this.shapeE.getY() !== this.epy){
                //创建新线的时候，要把之前的线删除
                // window.clearInterval(this.timer);
                this.createShape();
            }
        }
        //为线绑定鼠标点击的事件
        //
    }
    var my = {
        "first-name" : "joe",
        last_name:"hello"
    }

});