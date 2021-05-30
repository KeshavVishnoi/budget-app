//BUDGET CONTROLLER
var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var calculateTotal = function (type){
        var sum = 0;
        data.allItems[type].forEach(function (cur){
            sum += cur.value;
        });

        data.totals[type] = sum;
    };
    
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };

    return {
        addItem : function (type, des, val){
            var newItem, ID;

            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
              } else {
                  ID = 0;
              }
            
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);


            return newItem;

        },

        deletItem : function (type, id){
            var ids, index;
            // console.log(type,id);
            //map is similar to forEach but map returns an array
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }


        },

        calculateBudget : function (){
            // calc total
            calculateTotal('exp');
            calculateTotal('inc');

            //calc the budget inc - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calc the percentage of the income we spent
            if (data.totals.inc >0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
        //    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

        },
        
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
              
            
        },

        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp, 
                percentage : data.percentage,
            };
        },

        testing : function (){
            console.log(data);
        }
    };


})();



var UIController = (function(){
    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        expenses : '.expenses__list',
        income : '.income__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentage : '.budget__expenses--percentage',
        container : '.container-info',
        expensesPercLabel : '.item__percentage',
        monthLabel : '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        // 23150 
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        // document.querySelector(DOMstrings.inputType).;
        return (type == 'exp' ? '-' : '+') + ' ' + int + '.' + dec;


    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput : function(){
            return  {
            type : document.querySelector(DOMstrings.inputType).value,  
            description : document.querySelector(DOMstrings.inputDescription).value,  
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem : function(obj, type){
            var html, newHtml, element;
            
            //Make HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.income;
                html = '<div class="item" id="inc-%id%"> <div class="item__description">%description%</div><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>';
            }else if( type === 'exp'){
                element = DOMstrings.expenses;
                html = '<div class="item" id="exp-%id%"> <div class="item__description">%description%</div>  <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div>';
            }

            

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',  formatNumber(obj.value, type));


            //INsert string into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem : function(selectorID){
            var el;
            
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields : function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(currentVal, index, array){
                    currentVal.value = "";
            });

            fields[0].focus();
        },

        displayBudget : function(obj){
            var type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
           
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentage).textContent = '---';
            }

        },

        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0 ){
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent =  '---';
                }
            });

        },

        displayMonth : function(){
            var now, months, month, year;

            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;

        },

        changedType : function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType +
                 ',' + DOMstrings.inputDescription + 
                 ',' + DOMstrings.inputValue
                );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings : function(){
            return DOMstrings;
        }

        
    };

})();

var controller = (function(budgetCtrl,UICtrl){

    var setupEventListeners = function (){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){

            if (event.key === 'Enter' ){
                ctrlAddItem();
        };
     });
     document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
     document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function (){
        //1. Calculate the Budget
        budgetCtrl.calculateBudget();
        //2. Return the Budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        // console.log(budget);
    };

    var updatePercentages = function(){
        //1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from the budget controller
        var allPercentages = budgetCtrl.getPercentages();
        //3. Update the UI with the new percentages
        console.log(allPercentages); 
        UICtrl.displayPercentages(allPercentages);

    };

    var ctrlAddItem = function(){
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // console.log(input);
        //2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        
        // 4 CLear the fields

        UICtrl.clearFields();

        
        //5Calculate and update the budget
        updateBudget();

        //6. Update percentages
        updatePercentages();

        };

        
    };

    var ctrlDeleteItem = function (event){
        var itemID, splitID, type, ID;
        
        //event bubbling and delegation
        // console.log(event.target.parentNode.parentNode.parentNode.id); // this method shows the target of the click and show the parent of the node and gives the id cz of the propety at tge end

        itemID = event.target.parentNode.parentNode.parentNode.id;
        // console.log(itemID);
        if (itemID){
            splitID = itemID.split('-'); //returns an array
            type = splitID[0];
            ID = parseInt(splitID[1]);
                //js transforms numbers from primitive to objects
                //also when a string is used to call a method js adds a wrapper to convert it to an obj

            //1. Delete item from DS
            budgetCtrl.deletItem(type, ID);
            //2. Delete item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the budget
            updateBudget();

            //4. Update percentages
            updatePercentages();
        }

    };

    return {
        init: function(){
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListeners();
            UICtrl.displayMonth();
            console.log('Application Has Started');
        }
    };


})(budgetController, UIController);

controller.init();



