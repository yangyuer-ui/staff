
/*jslint browser:true */
(function () {
    function jumpTo() {
        var customerId = sessionStorage.customerId;
        if (customerId == undefined) {
            window.open('login.html');
        }
    }
    window.addEventListener("load", function () {
        jumpTo();

    });
}());
