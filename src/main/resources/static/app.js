var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (dibujo) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+dibujo, function (eventbody) {

                var pointJSON=JSON.parse(eventbody.body);
                addPointToCanvas(pointJSON);
                
                
            });
        });

    };
    
    

    return {

        init: function (dibujo) {
            var can = document.getElementById("canvas");
            
            //websocket connection
            connectAndSubscribe(dibujo);
            var can = document.getElementById("canvas");
            can.addEventListener("pointerdown", (event) => {
                var npoint = getMousePosition(event);
                stompClient.send("/app/newpoint."+dibujo, {}, JSON.stringify(npoint));
            })
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py,dibujo);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            console.log(stompClient);
            stompClient.send("/topic/newpoint."+dibujo, {}, JSON.stringify(pt));
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();