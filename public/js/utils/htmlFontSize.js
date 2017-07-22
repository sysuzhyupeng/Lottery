(function() {
    // 窗口尺寸改變時
    window.onresize = function() {
        setHtmlFontSize();
    }

    setHtmlFontSize();

    /**
     * [setHtmlFontSize 設置html根文字大小，隨著屏幕寬度改變，大小同時改變]
     */
    function setHtmlFontSize() {
        var container = document.getElementsByTagName('body')[0],
            html = document.getElementsByTagName('html'),
            html_width = parseInt(container.offsetWidth / 3.75) + "px";

        html[0].style.fontSize = html_width;
    }
})();