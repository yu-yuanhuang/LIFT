
(function(){
  function onReady(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  onReady(function(){
    var buttons = [
      {btn: document.getElementById('u15'), state: 'u18_state0'},
      {btn: document.getElementById('u16'), state: 'u18_state1'},
      {btn: document.getElementById('u17'), state: 'u18_state2'}
    ].filter(function(x){ return x.btn; });

    function syncActive(){
      buttons.forEach(function(item){
        var stateEl = document.getElementById(item.state);
        var visible = stateEl && window.getComputedStyle(stateEl).visibility !== 'hidden' && window.getComputedStyle(stateEl).display !== 'none';
        item.btn.classList.toggle('is-active', !!visible);
      });
    }

    buttons.forEach(function(item){
      item.btn.addEventListener('click', function(){
        setTimeout(syncActive, 40);
        setTimeout(syncActive, 180);
      });
    });
    syncActive();
    setInterval(syncActive, 500);

    var imageMap = [
      {selector:'#u19_img', path:'img/chart_config.png'},
      {selector:'#u37_img', path:'img/chart_get.png'},
      {selector:'#u38_img', path:'img/chart_compare.png'}
    ];
    imageMap.forEach(function(item){
      var img = document.querySelector(item.selector);
      if(!img) return;
      var test = new Image();
      test.onload = function(){ img.src = item.path; };
      test.src = item.path + '?v=' + Date.now();
    });

    var base = document.getElementById('base');
    if(base && !document.getElementById('network-links')){
      var note = document.createElement('div');
      note.className = 'network-link-note';
      note.textContent = '下列為網絡圖佔位按鈕，現階段先統一導向示例頁面。';
      base.appendChild(note);

      var wrap = document.createElement('div');
      wrap.id = 'network-links';
      var target = 'https://yu-yuanhuang.github.io/LIFT/修德國小3/index.html';
      var labels = ['網絡圖01','網絡圖02','網絡圖03','網絡圖04','網絡圖05','網絡圖06','網絡圖07','網絡圖08','網絡圖09','網絡圖10'];
      labels.forEach(function(label){
        var a = document.createElement('a');
        a.className = 'network-link-btn';
        a.href = target;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = label;
        wrap.appendChild(a);
      });
      base.appendChild(wrap);
    }
  });
})();
