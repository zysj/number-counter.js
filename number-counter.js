(function(factory,window){

    var w = window;
    if(!w || !w.document)return;
    // if(window.documentMode && window.documentMode<10){
    //     throw new Error('请使用IE10及以上版本的浏览器');
    // }
    if(typeof module === 'object' && typeof module.exports === 'object'){
        return (module.exports === factory(w));
    }
    if(typeof define == 'function' && typeof define.amd == 'object')define(factory);
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
                if(args[i] && args[i+1] && (isArray = args[i] instanceof Array) === args[i+1] instanceof Array){
                    continue;
                }
                isAllSame = true;
            }

            if(!isAllSame) return target;
            if(typeof target === undefined || target === null)target = isArray ? [] : {};
            sources = args.slice(1);
        }
        if((!sources.length && source) || sources.length == 1){
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

    /**
     * specialNums的使用方式：
     * 1、与speNumDirect组合使用。
     * 根据speNumDirect的方向，按照specialNums数组的元素顺序给每个数字添加效果
     * cycleTimes: 循环次数
     * totalMillSecond: 动画总时间
       
        speNumDirect:'right',
        specialNums:[{
            cycleTimes:1,
            totalMillSecond:1000,
        },{
            cycleTimes:3,
            totalMillSecond:2000
        },{
            cycleTimes:5,
            totalMillSecond:2500
        },{
            cycleTimes:7,
            totalMillSecond:3000
        }]
        
        2、单独使用
        指定某个位置的数字
        index: 指定位置
        interval: 动画间隔时间,
        descSpeed: 动画间隔时间增长速度
        descStart: 从倒数第几次开始递减
        
        specialNums:[{
                index:0,
                interval:400,
                descSpeed:100,
                descStart:3
        }]

        两种方式中的属性最好不要同时出现
     */

    numberCounter.prototype.defaults = {
        el:null,
        id:'number-counter',
        number:1000,            //最终显示的数字
        interval:30,            //更改数字的频率
        countTimes:10,          //更改数字的次数
        directForStop:'normal', //数字逐渐固定的方向。'lett'--从左向右固定;'right'--从右向左固定
        directDiff:1,            //数字间固定时间的差额
        showAnimate:false,           //以动画的方式呈现数字
        autoRun:true,                //是否自动执行动画
        isRandom:false,              //所有字符是否都进行随机数字显示
        isIncrease:true,             //在isRandom为false的情况下数字是否递增显示
        isRunSameTime:false,          //是否每一次变化都要等同一阶段的所有数字都变化完在执行下一阶段
        descSpeed:null,             //动画间隔时间增长速度
        endMillSecond:null,         //动画总时间
        speNumDirect:null,          //specialNums匹配方向
        specialNums:[]              //指定某个位置的数字的表现。例[{index:0,interval:400,descSpeed:100,descStart:3}]
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
     * 1、如果显示的数字的字符串长度大于初始化时的class为number-count-piece的元素的个数，就复制最后一个元素，假如到el中。
     * 2、可根据isBefore决定是否从第一位开始增加元素，删除元素只从第一位开始
     */
    numberCounter.prototype.addRestPiece = function(numStr,isBefore){
        numStr = numStr || this.numberStr;
        var counters = this.counters;
        isBefore = isBefore || false;
        if((diff = numStr.length - counters.length)>0){
            while(diff){
                var tmpPie = counters[counters.length-1].cloneNode(true);
                tmpPie.textContent = 0;
                if(isBefore){
                    counters[counters.length-1].parentNode.insertBefore(tmpPie,counters[0]);
                    counters = this.el.getElementsByClassName('number-count-piece');
                }else{
                    counters[counters.length-1].parentNode.appendChild(tmpPie);
                }
                diff--;
            }
            this.counters = this.el.getElementsByClassName('number-count-piece');
        }else{
            var index = 0;
            while(diff<0){
                counters[counters.length-1].parentNode.removeChild(counters[index]);
                index++;
                diff++;
            }
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
        var specialNums = option.specialNums;
        var len = this.hasCount = numStr.length;
        var start = directForStop === LEFT ? 0 : len-1;
        this.countNumber = countNumber.bind(this);      //给每个numberCounter一个专属的countNumber函数属性，用于后面的wrapNext函数不会因为countNumber的that问题而产生事件交叉
        this.hasCount -= specialNums.length || numStr.length;
        while(start>-1){
            if(directForStop === LEFT ? start>len-1 : start<0)break;
            var counter = counters[start];
            counter.nb = {};
            this.initCommon(start,this.option);

            if(specialNums && specialNums.length){
                this.initWayOfSpeNums(start,option);
            }else{
                this.initWayOfCommon(start,option);
            }
            
            if(directForStop === LEFT){
                start++;
            }else{
                start--;
            }
        }
    }

    /**
     * 初始化常用参数
     * @param {Number} start 
     * @param {Object} option 
     */
    numberCounter.prototype.initCommon = function(start,option){
        var counter = this.counters[start];
        var nb = counter.nb;
        var numStr = this.numberStr;
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
        nb.showNumber = isNaN(numStr[start]) ? numStr[start] : +numStr[start];
    }

    /**
     * 初始化指定位置动画方式参数
     * 1、选择某一个位置的数字计数时逐渐减缓，其他位置的计数同时从1到9循环计数。
     * 2、根据数组的元素位置给对应位置的数字循环递增或递减0~9，在最后一轮则在递增或递减至该数字
     * @param {Number} start 
     * @param {Object} option 
     */
    numberCounter.prototype.initWayOfSpeNums = function(start,option){
        var curSpecial,iterators,runInfo = null,numStr = this.numberStr;
        var counter = this.counters[start];
        var nb = counter.nb;
        var specialNums = option.specialNums;
        var speNumDirect = this.option.speNumDirect;
        var maxTime = !speNumDirect && specialNums && specialNums.length && this.maxTime();
        var showNumber = nb.showNumber;
        specialNums.map(function(item,i){
            var tindex = speNumDirect ?  i : item.index;
            var diff = specialNums.length - numStr.length;
            var tmpStart = start + (speNumDirect && speNumDirect != LEFT ? diff : 0);
            if(curSpecial)return;
            curSpecial = tindex == tmpStart ? item : null;
        });

        if(speNumDirect&&curSpecial){
            runInfo = caluSpeNumInfo(curSpecial.cycleTimes,curSpecial.totalMillSecond,showNumber);
            curSpecial.interval = runInfo.interval;
            curSpecial.times = runInfo.times;
        }else{
            runInfo = {interval:option.interval};
        }
        nb.isFirst = true;
        nb.times = curSpecial ? (speNumDirect ? curSpecial.times : +showNumber-1 ): (maxTime ? Math.floor(maxTime/option.interval)-1 : showNumber-1);
        iterators = runIterator({initfn:this.countNumber(counter,showNumber),initTimes:nb.times});
        nb.runIterator = nb.runIterator instanceof Array ? nb.runIterator.concat(iterators) : iterators;
        nb.specialNum = curSpecial || runInfo;
        option.autoRun && nb.runIterator && nb.runIterator.run();
    }

    /**
     * 初始化普通动画方式参数
     * 1、同时计数，同时结束，随机计数
     * 2、从左到右或从右到左随机计数逐渐停止
     * 3、从0开始计数直到该位置的数字为止而停止，同时开始，不同时结束
     * @param {Number} start 
     * @param {Object} option 
     */
    numberCounter.prototype.initWayOfCommon = function(start,option){
        var counter = this.counters[start];
        var nb = counter.nb;
        var showNumber = nb.showNumber;
        var directForStop = option.directForStop;
        var times = toNumber(option.countTimes);
        var isRandom = option.isRandom;
        var isIncrease = option.isIncrease;
        var directDiff = toNumber(option.directDiff) || 1;
        nb.descSpeed = option.endMillSecond ? calcuGradSpeed(times+1,option.interval,directDiff,this.numberStr.length-1,option.endMillSecond) : option.descSpeed; 
        if(isRandom||!isNaN(showNumber)){
            nb.isFirst = true;
            nb.times = isRandom ? getcountTimes(this.counters,start,times,directForStop,directDiff) : isIncrease ? +showNumber+(showNumber ? -1 : 1) : (10-showNumber-1);
            nb.runIterator = runIterator({initfn:this.countNumber(counter,showNumber),initTimes:nb.times});
            option.autoRun && nb.runIterator && nb.runIterator.run();
        }else{
            nb.times = 0;
            this.countNumber(counter,showNumber)();
        }
    }

    /**
     * 计算动画所需要的总时间
     */
    numberCounter.prototype.maxTime = function(){
        var specialNums = this.option.specialNums;
        if(!specialNums || !specialNums.length)return 0;
        var max = 0,tmpMax,num;
        for(var i = 0,len = specialNums.length;i<len;i++){
            num = +this.numberStr[specialNums[i].index] + 1;
            if(isNaN(num))continue;
            tmpMax = num*specialNums[i].interval+specialNums[i].descStart*(specialNums[i].descStart+1)*0.5*specialNums[i].descSpeed;
            max = tmpMax > max ? tmpMax : max;
        }
        return max;
    }

    /**
     * 包装runIterator赋予的next函数，实现动画同一阶段都执行才进行下一阶段
     * @param {Function} next
     */
    numberCounter.prototype.wrapNext = function(next,counter){
        if(!this.option.isRunSameTime){
            next && next();
        }else{
            this.hasCount--;
            if(!this.hasCount){
                this.hasCount = this.numberStr.length-this.option.specialNums.length;
                this.run();
                return;
            }
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
     * 执行最后一帧动画
     */
    numberCounter.prototype.toLast = function(){

        map(this.counters,function(counter){
            counter.nb.runIterator && counter.nb.runIterator.toLast();
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
        var that = this;
        map(this.counters,function(counter){
            if(that.option.isRunSameTime && counter.nb.specialNum)return;
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

    /**
     * 增加一次计数动画
     * @param {Number} index 
     * @param {Number} num 
     * @param {Number} times 
     * @param {Function} fn 
     */
    numberCounter.prototype.addIterator = function(index,num,times,fn){
        if(!toNumber(num))return;
        index = toNumber(index);
        var counter = this.counters[index-1];
        if(counter.nb.specialNum && times)counter.nb.times += times;
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
        if(counter.nb.runIterator.isStop){
            counter.nb.runIterator.isStop = false;
            counter.nb.runIterator.run();
        }
    }

    numberCounter.prototype.toNewNumber = function(newNum){
        if(isNaN(newNum))return;
        var old = +this.option.number;
        var oldStr = old+"";
        newNum = +newNum;
        var newStr = newNum+"";
        this.numberStr = newStr;
        var diff = newNum - old;
        var diffStr = diff+"";
        var diffLen = newStr.length-oldStr.length;
        var option = this.option;
        if(diffLen>0)this.addRestPiece(newStr,true);
        var counters = this.counters;
        for(var i = 0,len=newStr.length;i<len;i++){
            var index = i + (diffLen < 0 ? diffLen : 0);
            var counter = counters[i];
            if(!counter.nb){
                var nb = counter.nb = {};
                this.initCommon(i,option);
                if(option.specialNums && option.specialNums.length){
                    this.initWayOfSpeNums(i,option);
                }else{
                    this.initWayOfCommon(i,option);
                }
            }else{
                var hasPreNum = diffLen<=i;
                var oldNum = +oldStr[index-1];
                var newNum = +newStr[i];
                var times = nb.times = 10 + newNum-oldNum;
                while(times>0){
                    counter.nb.runIterator.push(this.countNumber(counter,newNum));
                    times--;
                }
            }
        }
        this.reRun();
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
        var option = this.option;
        function runAnimate(next){
            requestAnimationFrame(animation(that.wrapNext.bind(that,next,counter)));
        }
        return function(next){
            var nb = counter.nb;
            if(nb.nbtimer){
                clearTimeout(nb.nbtimer);
            }
            var interval = nb.nbInterval;
            var specialNum = nb.specialNum;
            var initTimes = nb.runIterator.option.initTimes;
            var countTimes = that.option.countTimes;
            var curLen = nb.runIterator.iterator && nb.runIterator.iterator.length >-1 ?  nb.runIterator.iterator.length : Infinity;
            if(specialNum && specialNum.descStart && curLen<specialNum.descStart){
                // if(curLen == 0)that.toLast();
                interval = specialNum.interval + specialNum.descSpeed*(specialNum.descStart - curLen+1);
            }else if(nb.descSpeed && curLen<initTimes-countTimes){
                interval += nb.descSpeed*(initTimes-countTimes - curLen+1);
            }else if(option.speNumDirect){
                interval = specialNum.interval;
            }
            counter.nb.nbtimer = setTimeout(runAnimate.bind(null,next),interval);
        }
    }

    //计算递减
    function calcuGradSpeed(baseTimes,interval,diff,diffLen,endTime){
        var totalDiff = diffLen*diff;
        var diffTime = endTime - interval*(baseTimes+totalDiff);
        var totalLen = (totalDiff+1)*totalDiff/2;
        return diffTime/totalLen;
    }

    function caluSpeNumInfo(cycles,totalms,num){
        var times = (cycles+ (cycles<2 ? 0 : -1))*10+num;
        return {
            times:times,
            interval:totalms/times
        }
    }

    /**
     * requestAnimationFrame动画函数的回调函数
     * @param counter {Node}
     * @param showNum {Integer}
     */
    function randomNumCallBack(counter,showNum){
        var nb = counter.nb;
        var random = nb.isRandom ? -2 : nb.isIncrease ? 0 :10;
        return function(next){

            return function(){
                var animateFn = nb.animateFn;
                if(nb.times && ((random - nb.times) != showNum || !nb.specialNum)){
                    if(nb.isRandom){
                        random = Math.floor(Math.random()*10);
                    }else{
                        if(nb.isIncrease){
                            random++;
                            if(random == 10)random =0;
                        }else{
                            random--;
                            if(random == -1)random =9;
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
            !this.isStop || (this.isStop = false);
            var rfn = this.iterator.shift();
            return rfn();
        }else{
            this.isStop = true;
        }
    }

    /**
     * 清除队列，结束执行
     */
    runIterator.prototype.end = function(){
        this.iterator.length = 0;
    }

    /**
     * 执行最后一个函数
     */
    runIterator.prototype.toLast = function(){
        this.iterator[0] = this.iterator[this.iterator.length-1];
        this.iterator.length = 1;
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
        var allArgs = [];
        if(args instanceof Array === true){
            allArgs = allArgs.concat(args);
        }
        if(otherFn)allArgs.push(otherFn);
        return function(){
            return fn.apply(null,allArgs);
        }
    }

    return window.numberCounter = numberCounter;

},window);