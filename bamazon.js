const mysql = require('mysql');
const inquirer = require('inquirer');
const boxen = require('boxen');

function bamazon() {
    console.clear();
    console.log(boxen('  ʙ  ᴀ  ᴍ  ᴀ  ᴢ  ᴏ  ɴ  ', {
        padding: 0,
        margin: 2,
        borderStyle: 'double',
        borderColor: 'cyan',
        align: 'center',
        float: 'center',
        dimBorder: true
    }));
}

function bmzn() {
    console.clear();
    console.log(boxen('  ʙ ᴍ ᴢ ɴ  ', {
        padding: 0,
        margin: 2,
        borderStyle: 'double',
        borderColor: 'cyan',
        align: 'center',
        float: 'center',
        dimBorder: true
    }));
}

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;

    resetTables();
    welcome();
});

function welcome() {
    bamazon();

    inquirer.prompt([
        {
            type: 'list',
            message: 'Welcome to  ʙ ᴀ ᴍ ᴀ ᴢ ᴏ ɴ ™! \n\nWhat would you like to do? \n',
            name: 'landing',
            choices: ["Start Shopping", "Contact Us"]
        }
    ]).then(function (response) {
        if (response.landing === "Start Shopping") {
            goShop();
        } else {
            contactSupp();
        };
    });
};

function contactSupp() {
    bmzn();

    inquirer.prompt([
        {
            type: 'list',
            message: 'Contact Us \n\nFor any inquiries, concerns, and/or feedback, feel free to contact us using our toll-free number at +1 (800) 555-5555. \nThank you for choosing  ʙ ᴀ ᴍ ᴀ ᴢ ᴏ ɴ ™  as we look forward to hearing from you! \n',
            name: 'support',
            choices: ["Go back"]
        }
    ]).then(function (response) {
        if (response.support === "Go back") {
            welcome();
        };
    });
}

function goShop() {
    bmzn();

    console.log("Items that are currently in stock: \n");

    connection.query(
        "SELECT * FROM products WHERE stock_quantity > 0", function (err, res) {
            if (err) throw err;

            for (var i = 0; i < res.length; i++) {
                console.log(`Book ID: ${res[i].item_id} \nTitle: "${res[i].book_name}" \nDepartment: ${res[i].department_name} \nPrice: $${res[i].price_USD} \nAvailability: ${res[i].stock_quantity} ct. \n`);
            };

            inputItems();
        }
    );
}

function inputItems() {
    inquirer.prompt([
        {
            type: 'input',
            message: "Enter a 'Book ID' to add to your shopping cart: ",
            name: 'inputid',
            validate: function validateInput(name) {
                return name !== '';
            }
        },
        {
            type: 'input',
            message: 'Quantity desired: ',
            name: 'inputq',
            validate: function validateInput(name) {
                return name !== '';
            }
        }
    ]).then(function (response) {
        var selectedId = parseInt(response.inputid);
        var selectedAmt = parseInt(response.inputq);

        verifyCart(selectedId, selectedAmt);
    });
}

function verifyCart(selectedId, selectedAmt) {
    connection.query(
        "SELECT item_id FROM products", function (err, res) {
            if (err) throw err;
            
            var adjInv;
            var validIds = [];
            var validIndex = validIds.indexOf(selectedId);

            for (var i = 0; i < res.length; i++) {
                validIds.push(parseInt(res[i].item_id));
            };

            if (validIndex === -1 && adjInv >= 0) {
                reviseId();
            } else if (validIndex !== -1 && adjInv < 0) {
                reviseAmt();
            } else if (validIndex === -1 && adjInv < 0) {
                reviseBoth();
            } else {
                connection.query(
                    `SELECT * FROM products WHERE item_id = ${selectedId}`, function (err, res) {
                        if (err) throw err;

                        adjInv = parseInt(res[0].stock_quantity) - selectedAmt;

                        if (adjInv >= 0) {
                            connection.query(
                                `SELECT COUNT(item_id) AS item_id FROM cart WHERE item_id = ${selectedId}`, function (err, res) {
                                    if (err) throw err;

                                    var idExistCost = res[0].item_id;

                                    if (validIndex !== -1 && adjInv >= 0 && idExistCost === 0) {
                                        addingToCart(selectedId, selectedAmt, adjInv);
                                    } else if (validIndex !== -1 && adjInv >= 0 && idExistCost !== 0) {
                                        alreadyInCart(selectedId, selectedAmt, adjInv);
                                    };
                                }
                            );
                        }
                    }
                );
            }
        }
    );
}

function addingToCart(selectedId, selectedAmt, adjInv) {
    connection.query(
        "UPDATE products SET ? WHERE ?", [
            {
                "stock_quantity": adjInv
            },
            {
                "item_id": selectedId
            }
        ], function (err, res) {
            if (err) throw err;
        }
    );

    connection.query(
        `SELECT * FROM products WHERE item_id = ${selectedId}`, function (err, res) {
            if (err) throw err;

            var calcAmt = parseFloat(res[0].price_USD) * selectedAmt;
            var adjAmt = calcAmt.toFixed(2);

            for (var i = 0; i < res.length; i++) {
                connection.query(
                    "INSERT INTO cart SET ?", {
                        "item_id": res[i].item_id,
                        "book_name": res[i].book_name,
                        "department_name": res[i].department_name
                    }, function (err, res) {
                        if (err) throw err;
                    }
                );
            };

            connection.query(
                "UPDATE cart SET ? WHERE ?", [
                    {
                        "price_USD": adjAmt
                    },
                    {
                        "item_id": selectedId
                    }
                ], function (err, res) {
                    if (err) throw err;
                }
            );

            connection.query(
                "UPDATE cart SET ? WHERE ?", [
                    {
                        "quantity": selectedAmt
                    },
                    {
                        "item_id": selectedId
                    }
                ], function (err, res) {
                    if (err) throw err;

                    shopOptions();
                }
            );
        }
    );
}

function alreadyInCart(selectedId, selectedAmt, adjInv) {
    connection.query(
        "UPDATE products SET ? WHERE ?", [
            {
                "stock_quantity": adjInv
            },
            {
                "item_id": selectedId
            }
        ], function (err, res) {
            if (err) throw err;
        }
    );

    connection.query(
        `SELECT * FROM cart WHERE item_id = ${selectedId}`, function (err, res) {
            if (err) throw err;

            var subQuantity = parseInt(res[0].quantity);
            var updQuantity = subQuantity + selectedAmt;

            connection.query(
                `SELECT * FROM products WHERE item_id = ${selectedId}`, function (err, res) {
                    if (err) throw err;

                    var updPrice = (parseFloat(res[0].price_USD) * updQuantity).toFixed(2);

                    connection.query(
                        "UPDATE cart SET ? WHERE ?", [
                            {
                                "quantity": updQuantity
                            },
                            {
                                "item_id": selectedId
                            }
                        ], function (err, res) {
                            if (err) throw err;

                        }
                    );

                    connection.query(
                        "UPDATE cart SET ? WHERE ?", [
                            {
                                "price_USD": updPrice
                            },
                            {
                                "item_id": selectedId
                            }
                        ], function (err, res) {
                            if (err) throw err;

                            shopOptions();
                        }
                    );
                }
            );
        }
    );
}

function reviseId() {
    inquirer.prompt([
        {
            type: 'list',
            message: "\n\nThe 'Book ID' you entered does not exist in our catalogue. Please enter a valid ID. \n",
            name: 'revise',
            choices: ["Go back"]
        }
    ]).then(function (response) {
        if (response.revise === "Go back") {
            goShop();
        }
    });
}

function reviseAmt() {
    inquirer.prompt([
        {
            type: 'list',
            message: '\n\nThe quantity entered exceeds the availability of the selected product! Please revise your input. \n',
            name: 'revise',
            choices: ["Go back"]
        }
    ]).then(function (response) {
        if (response.revise === "Go back") {
            goShop();
        }
    });
}

function reviseBoth() {
    inquirer.prompt([
        {
            type: 'list',
            message: "\n\nYour inputs for a 'Book ID' and the quantity are both invalid! Please revise your entries. \n",
            name: 'revise',
            choices: ["Go back"]
        }
    ]).then(function (response) {
        if (response.revise === "Go back") {
            goShop();
        }
    });
}

function shopOptions() {
    inquirer.prompt([
        {
            type: 'list',
            message: '\n\nItem(s) have been added to your shopping cart. What would you like to do? \n',
            name: 'options',
            choices: ["Keep shopping", "Go to cart"]
        }
    ]).then(function (response) {
        if (response.options === "Keep shopping") {
            goShop();
        } else {
            goToCart();
        };
    });
}

function goToCart() {
    connection.query(
        "SELECT * FROM cart", function (err, res) {
            if (err) throw err;

            bmzn();

            console.log("\nYour shopping cart: ");

            var subt = [];

            for (var i = 0; i < res.length; i++) {
                subt.push(res[i].price_USD);

                var adjCost = (res[i].price_USD).toFixed(2);

                console.log(`\nBook ID: ${res[i].item_id} \nTitle: "${res[i].book_name}" \nSeries: ${res[i].department_name} \nPrice: $${adjCost} \nQuantity: ${res[i].quantity} \n`);
            };

            function getSum(total, num) {
                return total + num;
            }

            var subtotal = (subt.reduce(getSum)).toFixed(2);

            console.log(`\n\nSubtotal:  $ ${subtotal} \nShipping:  FREE`);

            shoppingCart();
        }
    );
}

function shoppingCart() {
    inquirer.prompt([
        {
            type: 'list',
            message: '\n\nWhat would you like to do? ',
            name: 'options',
            choices: ["Keep shopping", "Remove an item", "Checkout"]
        }
    ]).then(function (response) {
        if (response.options === "Keep shopping") {
            goShop();
        } else if (response.options === "Remove an item") {
            removeItems();
        } else {
            checkOut();
        };
    });
}

function removeItems() {
    inquirer.prompt([
        {
            type: 'input',
            message: "\nEnter the 'Book ID' of the item to remove from cart: ",
            name: 'id',
            validate: function validateInput(name) {
                return name !== '';
            }
        },
        {
            type: 'input',
            message: '\nQuantity desired: ',
            name: 'quantity',
            validate: function validateInput(name) {
                return name !== '';
            }
        }
    ]).then(function (response) {
        var removeId = parseInt(response.id);
        var removeAmt = parseInt(response.quantity);

        connection.query(
            "SELECT item_id FROM cart", function (err, res) {
                if (err) throw err;

                var deleteCheck = [];

                for (var i = 0; i < res.length; i++) {
                    deleteCheck.push(parseInt(res[i].item_id));
                };

                var checkIndex = deleteCheck.indexOf(removeId); // checking deleteCheck if exists

                if (checkIndex !== -1) {
                    connection.query(
                        `SELECT * FROM cart WHERE item_id = ${removeId}`, function (err, res) {
                            if (err) throw err;

                            var subCartQty = parseInt(res[0].quantity);
                            var updCartQty = subCartQty - removeAmt;

                            if (updCartQty >= 0) {
                                connection.query(
                                    `SELECT * FROM products WHERE item_id = ${removeId}`, function (err, res) {
                                        if (err) throw err;

                                        var subProdQty = parseFloat(res[0].price_USD);
                                        var adjProdPrice = (updCartQty * subProdQty).toFixed(2);
                                        var updProdQty = parseInt(res[0].stock_quantity) + removeAmt;

                                        balanceProdCart(removeId, removeAmt, adjProdPrice, updCartQty, subCartQty, updProdQty);

                                        inquirer.prompt([
                                            {
                                                type: 'list',
                                                message: '\nYour shopping cart has been updated!',
                                                name: 'update',
                                                choices: ["Go to cart"]
                                            }
                                        ]).then(function(response) {
                                            if (response.update === "Go to cart") {
                                                goToCart();
                                            }
                                        });
                                    }
                                );
                            } else {
                                console.log("\nThe ID you entered is not in your cart. Please revise your entries.");

                                removeItems();
                            };
                        }
                    );
                } else {
                    console.log("\nThe quantity exceeds your ");
                    
                    removeItems();
                };
            }
        );
    });
}

function balanceProdCart(removeId, removeAmt, adjProdPrice, updCartQty, subCartQty, updProdQty) {
    connection.query(
        "UPDATE cart SET ? WHERE ?", [
            {
                "price_USD": adjProdPrice
            },
            {
                "item_id": removeId
            }
        ], function (err, res) {
            if (err) throw err;

            connection.query(
                "UPDATE cart SET ? WHERE ?", [
                    {
                        "quantity": updCartQty
                    },
                    {
                        "item_id": removeId
                    }
                ], function (err, res) {
                    if (err) throw err;

                    if (subCartQty === 0) {
                        connection.query(
                            `DELETE FROM cart WHERE item_id = ${removeAmt}`, function (err, res) {
                                if (err) throw err;

                                connection.query(
                                    "UPDATE products SET ? WHERE ?", [
                                        {
                                            "stock_quantity": updProdQty
                                        },
                                        {
                                            "item_id": removeId
                                        }
                                    ], function (err, res) {
                                        if (err) throw err;
                                    }
                                );
                            }
                        );
                    };
                }
            );
        }
    );
}

function checkOut() {

}

function resetTables() {
    connection.query(
        "UPDATE products SET stock_quantity = 30 WHERE item_id = 1010",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 20 WHERE item_id = 1011",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 20 WHERE item_id = 1012",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2021",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2022",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2023",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2024",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2025",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3032",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3033",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3034",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3035",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "TRUNCATE TABLE cart",
        function (err, res) {
            if (err) throw err;
        }
    );
}