const net = require('net');

class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

class OrderProduct {
    constructor(product, cnt) {
        this.product = product;
        this.cnt = cnt;
    }
}

class Order {
    constructor() {
        this.products = {};
    }

    getProductsCnt() {
        let cnt = 0;
        for (const [id, orderItem] of Object.entries(this.products)) {
            cnt += orderItem.cnt;
        }
        return cnt;
    }

    addProduct(product) {
        if (this.products[product.id] instanceof OrderProduct) {
            this.products[product.id].cnt++;
        } else {
            this.products[product.id] = new OrderProduct(product, 1);
        }
        return true;
    }

    process() {
        let priceTotal = 0.0;
        for (const [id, orderItem] of Object.entries(this.products)) {
            priceTotal += orderItem.cnt * orderItem.product.price;
        }
        return {
            priceTotal: priceTotal,
            product: this.products
        }
    }
}

class Result {
    constructor(status, data = null, msg = null) {
        this.status = status;
        this.data = data;
        this.msg = msg;
    }
}

class Response {
    constructor(result, sessionId) {
        this.status = result.status;
        this.data = result.data;
        this.msg = result.msg;
        this.sessionId = sessionId;
    }
}

class Model {

    sessions = {}

    products = {
        1: new Product(1, 'Tuareg 100g', 90.0),
        2: new Product(2, 'Mate IQ 100g', 95.0),
        3: new Product(3, 'Aromatizovaná káva karamel 60g', 80.0),
        4: new Product(4, 'Tchibo original 200g', 120.0)
    }

    getSessionId () {
        let token = Math.random().toString(36).substr(2,15);
        this.sessions[token] = {};
        return token;
    }

    getProduct(productId) {
        return this.products[productId];
    }

}

class OrderFunctionality {

    constructor(model) {
        this.model = model;
    }

    open (sessionId) {
        if (this.model.sessions[sessionId] instanceof Order) {
            return new Result(false, null, "Can't open already opened order.");
        }
        this.model.sessions[sessionId] = new Order();
        return new Result(true, null, "Order successfully opened.");
    }

    add (sessionId, productId) {
        if (!this.model.sessions[sessionId] || !(this.model.sessions[sessionId] instanceof Order)) {
            return new Result(false, null, "Can't add product into not opened order.");
        }
        return new Result(
            this.model.sessions[sessionId].addProduct(this.model.getProduct(productId)),
            null,
            "Product successfully added into order."
        );
    }

    process (sessionId) {
        if ( !(this.model.sessions[sessionId] instanceof Order) || this.model.sessions[sessionId].getProductsCnt() < 1 ) {
            return new Result(false, null, "Can't process not opened or empty order.");
        }
        let processedOrder = this.model.sessions[sessionId].process();
        delete this.model.sessions[sessionId];
        return new Result(true, processedOrder, "Order successfully processed.");
    }

}

let model = new Model();
let orderFunctionality = new OrderFunctionality(model);

const server = net.createServer((c) => {

    console.log('Socket opened');

    c.setEncoding('utf8');

    c.on('end', () => {
        console.log('Socket closed');
    });

    c.on('data', (data) => {

        console.log(data);

        data = data.toString().trim();

        if (!data) {
            return;
        }

        try {
            data = JSON.parse(data);
        } catch (e) {
            let resp = new Response(
                new Result(false, null, "Invalid format."),
                data.sessionId
            )
            c.write(JSON.stringify(resp));
        }

        if (typeof data != "object") {
            return;
        }

        if (data.action === "open") {
            let sessionId = model.getSessionId();
            let res = orderFunctionality.open(sessionId);
            c.write(
                JSON.stringify(new Response(res, sessionId))
            );
        }

        if (data.action === "add") {
            let res = orderFunctionality.add(data.sessionId, data.data.productId);
            c.write(
                JSON.stringify(new Response(res, data.sessionId))
            );
        }

        if (data.action === "process") {
            let res = orderFunctionality.process(data.sessionId);
            if (res.status === true) {
                data.sessionId = null;
            }
            c.write(
                JSON.stringify(new Response(res, data.sessionId))
            );
        }

        console.log(orderFunctionality.model.sessions);

    });

});

// Start server on port 3000
server.listen(3000, () => {
    console.log('Server started');
});