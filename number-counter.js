(function(factory,window){

    var w = window;
    if(!w || !w.document)return;
    if(window.documentMode && window.documentMode<10){
        throw new Error('请使用IE10及以上版本的浏览器');
    }
    if(typeof module === 'object' && typeof module.exports === 'object'){
        return (module.exports === factory(w));
    }
    return factory(w); 

})(function(window){

    //简单的多个对象的继承，不存在深递归复制
    function extend(target,source){
        var isArray = false, isAllSame = true,sources=[],i;
        var args = Array.prototype.slice.call(arguments,0);
        if(args.length == 0 && (typeof target === undefined || target === null))return {};
        if(args.length == 1){
            source = target;
            target = (isArray = source instanceof Array === true) ? [] : {};
        }else{
            for(var k=0, len=args.length;i<len;i++){
                if(i == args.length-1){
                    isAllSame = false;
                    break;
                }
                if(args[i] && args[i+1] &&　(isArray = args[i] instanceof Array) === args[i+1] instanceof Array){
                    continue;
                }
                isAllSame = true;
            }

            if(!isAllSame) return target;
            if(typeof target === undefined || target === null)target = isArray ? [] : {};
            sources = args.slice(1);
        }
        if((!sources.length &&　source) || sources.length == 1){
            sources.length && (source = sources[0]);
            if(isArray){
                for(i = 0,len=source.length;i<len;i++){
                    target[i] = source[i];
                }
            }else{
                for(i in source){
                    target[i] = source[i];
                }
            }
        }else{
            for(i = 0,len=sources.length;i<len;i++){
                extend(target,sources[i]);
            }
            return target;
        }
        return target;
    }
    
    var NORMAL = 'normal',
        LEFT = 'left',
        RIGHT = 'right',
        TOP = 'top',
        BOTTOM = 'bottom',
        UP = 'up',
        DOWN = 'down',
        SHOW = 'show',
        HIDE = 'hide',
        ANIMATE = 'animate',
        BEFORE = 'before';

    var initNumber = 0;

    var classArr = {
        'before':'before-piece',
        'normal':'normal-piece',
        'animate':'animate-piece',
        'hide':'hide-piece',
        'show':'show-piece'
    } 

    function numberCounter(option){
        if(this instanceof numberCounter !== true){
            return new numberCounter(option);
        }
        this.option = extend({},this.defaults,option);
        this.init();
    }

    numberCounter.prototype.defaults = {
        el:null,
        id:'number-counter',
        number:1000,            //最终显示的数字
        interval:50,            //更改数字的频率
        countTimes:10,          //更改数字的次数
        directForStop:'normal', //数字逐渐固定的方向。'lett'--从左向右固定;'right'--从右向左固定
        directDiff:1,            //数字间固定时间的差额
        showAnimate:false,           //以动画的方式呈现数字
        autoRun:true,                //是否自动执行动画
        isRandom:true,              //所有字符是否都进行随机数字显示
        isIncrease:true,             //在isRandom为false的情况下数字是否递增显示
        isRunSameTime:false          //是否每一次变化都要等同一阶段的所有数字都变化完在执行下一阶段
    }

    numberCounter.prototype.init = function(){
        this.el = this.option.el || document.getElementById(this.option.id);
        this.counters = this.el.getElementsByClassName('number-count-piece');
        this.numberStr =  toNumber(this.option.number) > 0 ? this.option.number+'' : '1000'; 
        this.addRestPiece();
        this.runCount();
        initNumber++;
    }

    /**
     * 如果显示的数字的字符串长度大于初始化时的class为number-count-piece的元素的个数，就复制最后一个元素，假如到el中。
     */
    numberCounter.prototype.addRestPiece = function(){
        var numStr = this.numberStr;
        var counters = this.counters;
        if((diff = numStr.length - counters.length)>0){
            while(diff){
                var tmpPie = counters[counters.length-1].cloneNode(true);
                counters[counters.length-1].parentNode.appendChild(tmpPie);
                diff--;
            }
            this.counters = this.el.getElementsByClassName('number-count-piece');
        }
    }

    /**
     * 初始化动画所需参数
     */
    numberCounter.prototype.runCount = function(){
        var numStr = this.numberStr;
        var counters = this.counters;
        var option = this.option;
        var directForStop = option.directForStop;
        var directDiff = toNumber(option.directDiff) || 1;
        var len = this.hasCount = numStr.length;
        var times = toNumber(option.countTimes);
        var start = directForStop === LEFT ? 0 : len-1;
        var isRandom = option.isRandom;
        var isIncrease = option.isIncrease;
        this.countNumber = countNumber.bind(this);      //给每个numberCounter一个专属的countNumber函数属性，用于后面的wrapNext函数不会因为countNumber的that问题而产生事件交叉
        while(start>-1){
            if(directForStop === LEFT ? start>len-1 : start<0)break;
            var counter = counters[start];
            var nb = counter.nb = {};
            nb.nbtimer = null;
            nb.nbInterval = toNumber(option.interval);
            nb.isRandom = option.isRandom;
            nb.isIncrease = option.isIncrease;
            if(option.showAnimate){
                nb.animateFn = transitionCallBack || false;
                nb.showAnimate = option.showAnimate;
                initPieceCallback(counter);
            }else{
                commonCallBack(counter,0);
                nb.animateFn = commonCallBack;
            }
            var showNumber = numStr[start];
            if(isRandom || !isNaN(showNumber)){
                nb.isFirst = true;
                nb.times = isRandom ? getcountTimes(counters,start,times,directForStop,directDiff) : isIncrease ? +showNumber-1 : (10-showNumber-1);
                nb.runIterator = runIterator({initfn:this.countNumber(counter,showNumber),initTimes:nb.times});
                option.autoRun && nb.runIterator && nb.runIterator.run();
            }else{
                nb.times = 0;
                this.countNumber(counter,showNumber)();
            }
            if(directForStop === LEFT){
                start++;
            }else{
                start--;
            }
            //执行第一次初始化
            nb.animateFn(counter,0);
        }
    }

    /**
     * 包装runIterator赋予的next函数，实现动画同一阶段都执行才进行下一阶段
     * @param {Function} next
     */
    numberCounter.prototype.wrapNext = function(next){
        if(this.option.isRunSameTime){
            this.hasCount--;
            if(!this.hasCount){
                this.hasCount = this.numberStr.length;
                this.run();
                return;
            }
        }else{
            next && next();
        }
    }

    /**
     * 结束动画
     */
    numberCounter.prototype.end = function(){

        map(this.counters,function(counter){
            counter.nb.runIterator && counter.nb.runIterator.end();
        })
    }
    /**
     * 暂停动画
     */
    numberCounter.prototype.stop = function(index){
        map(this.counters,function(counter){
            counter.nb.runIterator && counter.nb.runIterator.stop(index);
        });
    }
    /**
     * 继续动画
     */
    numberCounter.prototype.reRun = function(){
        map(this.counters,function(counter){
            counter.nb.runIterator && counter.nb.runIterator.reRun();
        });
    }
    /**
     * 执行动画
     */
    numberCounter.prototype.run = function(){
        map(this.counters,function(counter){
            counter.nb.runIterator && counter.nb.runIterator.run();
        });
    }
    /**
     * 增加执行次数
     */
    numberCounter.prototype.addTimes = function(num){
        map(this.counters,function(counter){
            counter.nb.runIterator && counter.nb.runIterator.addTimes(num);
        });
    }

    numberCounter.prototype.addIterator = function(index,num,times,fn){
        if(!toNumber(num))return;
        index = toNumber(index);
        var counter = this.counters[index];
        if(!toNumber(times))times = 1;
        if(typeof fn !== 'function'){
            fn = this.countNumber(counter,num);
        }else{
            fn = fn.bind(this,counter,num);
        }
        while(times>0){
            counter.nb.runIterator.push(fn);
            times--;
        }
        counter.nb.runIterator.run();
    }
    

    /**
     * 从上或下动画出现时绑定动画结束事件
     * @param {Node} counter 
     */
    function initPieceCallback(counter){
        var topPieces = counter.getElementsByClassName(classArr[ANIMATE]);
        map(topPieces,function(piece){
            toggleClass(piece,classArr[BEFORE],true);
            addEvent(piece,'webkitTransitionEnd otransitionend oTransitionEnd transitionend',function(e){
                var className = piece.className;
                if(className.indexOf(classArr[HIDE])>-1){
                    toggleClass(piece,classArr[HIDE],false);
                }
            });
        });
    }

    /**
     * 获取更改数字的次数 
     * @param {Node} counters 
     * @param {Integer} index 
     * @param {Integer} start 
     * @param {String} direct 
     * @param {Integer} directDiff 
     */
    function getcountTimes(counters,index,start,direct,directDiff){
        if(!counters || !counters.length || index === undefined || index === null)return start || 10;
        if(!start){
            start = Math.floor(Math.random()*5+10);
        }
        if(!direct || typeof direct != 'string' || direct === NORMAL){
            return start;
        }
        if(direct === LEFT ? index !== 0 : index !== counters.length-1){
            index += direct === LEFT ? (-1) : 1;
            start = counters[index].nb.times + (directDiff || 0);
        }
        return start;
    }

    //常规动画：使用requestAnimationFrame动画函数
    function countNumber(counter,showNum){
        var that = this;
        var animation = randomNumCallBack(counter,showNum);
        
        function runAnimate(next){
            requestAnimationFrame(animation(that.wrapNext.bind(that,next)));
        }
        return function(next){
            if(counter.nb.nbtimer){
                clearTimeout(counter.nb.nbtimer);
            }
            counter.nb.nbtimer = setTimeout(runAnimate.bind(null,next),counter.nb.nbInterval);
        }
    }

    /**
     * requestAnimationFrame动画函数的回调函数
     * @param counter {Node}
     * @param showNum {Integer}
     */
    function randomNumCallBack(counter,showNum,next){
        var nb = counter.nb;
        var random = nb.isRandom ? -2 : nb.isIncrease ? 0 :10;
        return function(next){

            return function(){
                var animateFn = nb.animateFn;
                if(nb.times && (random - nb.times) != showNum){
                    if(nb.isRandom){
                        random = Math.floor(Math.random()*10);
                    }else{
                        if(nb.isIncrease){
                            random++;
                        }else{
                            random--;
                        }
                    }
                    animateFn && animateFn(counter,random);
                    nb.times--;
                }else{
                    animateFn && animateFn(counter,showNum);
                }
                next && next();
            }
        }
    }

    /**
     * 普通出现与消失动画
     * @param {Node} counter 
     * @param {Integer} showNum 
     */
    function commonCallBack(counter,showNum){
        counter.textContent = showNum;
    }


    /**
     * 随机数字根据class效果出现
     * @param {Node} counter
     * @param {Integer} showNum
     */
    function transitionCallBack(counter,showNum){
        var curChild,lastChild;
        var animatePies = counter.getElementsByClassName(classArr[ANIMATE]);
        if(!counter.childIndex){
            curChild = animatePies[0];
            lastChild = animatePies[1]
            counter.childIndex = 1;
        }else{
            curChild = animatePies[1];
            lastChild = animatePies[0]
            counter.childIndex = 0;
        }
        curChild.textContent = showNum;
        toggleClass(curChild,classArr[SHOW],true);
        if(!counter.nb.isFirst){
            toggleClass(lastChild,classArr[HIDE],true);
            toggleClass(lastChild,classArr[SHOW],false);
        }else{
            counter.nb.isFirst = false;
        }
    }

    /**
     * 绑定事件
     * @param {Node} node
     * @param {String or Array} eventNames
     * @param {Function} fn
     * @param {Boolean} useCapture
     */
    function addEvent(node,eventNames,fn,useCapture){
        if(!node || typeof fn != 'function')return;
        if(typeof eventNames != 'string' && eventNames instanceof Array !==true)return;
        if(typeof eventNames === 'string'){
            eventNames = eventNames.split(/\s|\,/g);
        }
        if(window.attachEvent){
            eventNames.map(function(name){
                node.attachEvent(name,fn);
            })
        }
        if(window.addEventListener){
            eventNames.map(function(name){
                node.addEventListener(name,fn,useCapture || false);
            })
        }
    }

    /**
     * map工具函数，使用传统循环速度较快
     * @param {Array} arr
     * @param {Function} fn
     * @param {Object} args
     */
    function map(arr,fn,arg){
        // var args = slice(arguments,1);
        // Array.prototype.map.apply(arr,args);
        if(!arr || (!arr.length && arr instanceof Array !== true))return;
        if(typeof fn != 'function')return;
        for(var i = 0,len=arr.length;i<len;i++){
            fn.call(arg||null,arr[i],i,arr);
        }
    }

    /**
     * slice工具函数
     * @param {Array} arr
     * @param {Integer} start
     * @param {Integer} end
     */
    function slice(arr,start,end){
        return Array.prototype.slice.call(arr,start || 0,end);
    }

    /**
     * 添加或删除class
     * @param {Node} node
     * @param {String} name
     * @param {Boolean} isAdd true--添加;false--删除
     */
    function toggleClass(node,name,isAdd){
        if(!node || node.nodeType !='1')return;
        var className = node.className;
        if(typeof name === 'string'){
            var reg = new RegExp('\\\s?'+name+'\\\s?','g');
            if(!isAdd){
                className = className.replace(reg,'');
            }else{
                className += ' '+name+' ';
            }
        }
        node.className = className;
    }

    /**
     * 转化数字或判断是否是数字
     * @param {Number or String} num
     */
    function toNumber(num){
        if(num === undefined || num === null)return 0;
        if(isNaN(num) || !isFinite(num)){
            return 0;
        }
        return +num;
    }

    /**
     * 流程控制类
     * @param {Object} option 
     */
    function runIterator(option){
        if(this instanceof runIterator !== true){
            return new runIterator(option);
        }
        this.option = extend({},this.defaults,option);
        this.iterator = [];
        this.isStop = false;
        this.next = this.next.bind(this);
        this.stopIndex = -1;
        this.initIterator();
    }

    runIterator.prototype.defaults = {
        initfn:null,    //初始入队列的函数
        initTimes:0     //调用次数
    }

    /**
     * 初始化迭代器
     */
    runIterator.prototype.initIterator = function(){
        var initTimes = this.option.initTimes;
        var initfn = this.option.initfn;
        if(initTimes<0 || !initfn)return;
        while(initTimes>-1){
            this.push(initfn);
            initTimes--;
        }
    }

    /**
     * 执行下一步
     * @param {Array} arguments
     */
    runIterator.prototype.next = function(){
        var args = slice(arguments);
        args.push(this.next);
        return this.run.apply(this,args);
    }

    /**
     * 把一个函数放到队列末端
     * @param {Function} fn
     */
    runIterator.prototype.push = function(fn){
        var args = slice(arguments,1);
        var wfn = wrapFn(fn,args,this.next);
        this.splice(wfn,this.iterator.length,0);
    }

    /**
     * 封装的splice函数
     * @param {Function} fn
     * @param {Integer} index
     * @param {Integer} i
     */
    runIterator.prototype.splice = function(fn,index,i){
        var args = slice(arguments,3);
        var spliceArgs = slice(arguments,1,3);
        spliceArgs.push(fn);
        Array.prototype.splice.apply(this.iterator,spliceArgs);
    }

    /**
     * 增加执行次数
     * @param {Integer} num
     */
    runIterator.prototype.addTimes = function(num){
        if(!(num = toNumber(num)))return;
        this.initTimes += num;
    }

    /**
     * 运行队列第一个函数
     */
    runIterator.prototype.run = function(){
        if(this.iterator.length){
            if(this.isStop || this.stopIndex == this.iterator.length)return;
            var rfn = this.iterator.shift();
            return rfn();
        }
    }

    /**
     * 清除队列，结束执行
     */
    runIterator.prototype.end = function(){
        this.iterator.length = 0;
    }

    /**
     * 暂停执行
     * @param {Integer} index
     */
    runIterator.prototype.stop = function(index){
        if(index = toNumber(index)){
            this.stopIndex = this.iterator.length-index;
        }else{
            this.isStop = true;
        }
    }

    /**
     * 继续执行
     */
    runIterator.prototype.reRun = function(){
        if(!this.isStop || this.stopIndex>-1)return;
        this.isStop = false;
        this.stopIndex = -1;
        this.run();
    }

    /**
     * 包装一个函数，使其绑定一些参数。
     * @param {Function} fn 
     * @param {Array} args 
     * @param {Function or Array<Function>} otherFn 
     */
    function wrapFn(fn,args,otherFn){
        var allArgs = [fn];
        if(args instanceof Array !== true ){
            args = [].concat(args);
        }
        if(otherFn)args = args.concat(otherFn);
        allArgs = allArgs.concat(args);
        var tmp = ['fn'];
        var fnStr = 'return fn.bind(null';
        for(var i = 0,len=args.length;i<len;i++){
            tmpArg = 'arg' + i;
            tmp.push(tmpArg);
                fnStr += ','+tmpArg;
        }
        fnStr += ')';
        tmp.push(fnStr);
        var tmpFn = Function.apply(null,tmp);
        return tmpFn.apply(null,allArgs);
    }

    window.numberCounter = numberCounter;

},window);