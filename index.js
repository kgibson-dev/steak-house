import { menuArray } from "./data.js"
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

const checkout = document.getElementById('checkout')
const checkoutItemsContainer = document.getElementById('checkout-items-container')
const checkoutTotalPrice = document.getElementById('checkout-total-price')
const paymentModal = document.getElementById('payment-modal')
const successModal = document.getElementById('success-modal')


let menuCategoryHtml =``
function filterCategory(category){
    menuCategoryHtml = ``
    const categoryFilter = menuArray.filter(item => item.category === category)
    categoryFilter.forEach(function(item){
        menuCategoryHtml += `
        <div class="menu-item-container">
            <div class="item-image-container">
                <img class="item-image" src="${item.image}">
            </div>
            <div class="item-descrption-container">
                <p>${item.name}</p>
                <p class="item-ingredients">${item.ingredients}</p>
                <p class="item-price">£${item.price}</p>
            </div>
            <div class="item-add-minus-icons-container">
                <div class="minus-btn hidden"  id='minus-btn-${item.id}'>
                    <i class="fa-solid fa-minus item-add-minus-icons" data-minusitem="${item.id}"></i>
                </div>
                <div class="add-btn">
                    <i class="fa-solid fa-plus item-add-minus-icons" data-additem="${item.id}"></i>
                </div>
            </div>
        </div>
        `
    })
    return menuCategoryHtml
}


function renderMenuItems(){
    const catagories = ['steaks', 'sides', 'drinks']
    catagories.forEach(function(category){
        document.getElementById(`item-category-${category}`).innerHTML = filterCategory(category)
    })
    
}

renderMenuItems()


document.addEventListener("click", function(e){
    if(e.target.dataset.additem){
        handleAddItemClick(e.target.dataset.additem)
    } else if(e.target.dataset.minusitem){
        handleMinusItemClick(e.target.dataset.minusitem)
    } else if(e.target.dataset.itemid){
        handleRemoveItemClick(e.target.id, e.target.dataset.itemid) 
    } else if (e.target.id === "checkout-btn") {
        handleCompleteOrderClick()
    } else if(e.target.id === "succes-modal-btn") {
        handleContinueClick()
    } 
})



let currentOrder = []

function handleAddItemClick(itemId){
    if(!currentOrder.length) {
        checkout.classList.toggle("hidden")
        document.querySelector(`#minus-btn-${itemId}`).classList.toggle("hidden") 
        currentOrder.push({id: itemId, name: menuArray[itemId].name, price: menuArray[itemId].price, count: 1})
     } else if (currentOrder.findIndex(item => item.id === itemId) < 0) {
            currentOrder.push({id: itemId, name: menuArray[itemId].name, price: menuArray[itemId].price, count: 1})
            document.querySelector(`#minus-btn-${itemId}`).classList.toggle("hidden")
    } else {
        currentOrder[(currentOrder.findIndex(item => item.id === itemId))].count += 1
    }
   renderOrder(currentOrder)
}
    


function handleMinusItemClick(itemId){
    const orderedItem = currentOrder[(currentOrder.findIndex(item => item.id === itemId))]
    if(orderedItem.count > 0) {
        orderedItem.count -= 1
        if (orderedItem.count === 0){
            currentOrder.splice(currentOrder.findIndex(item => item.id === itemId),1)
            document.querySelector(`#minus-btn-${itemId}`).classList.toggle("hidden")
        }
    }
    renderOrder(currentOrder)
    }



let totalPrice = 0        

function renderOrder(currentOrder){
    checkoutItemsContainer.innerHTML = `<div class="checkout-title">Your Order</div>`
    checkoutTotalPrice.innerHTML = ``
    totalPrice = 0 
    currentOrder.forEach(function(item){
        checkoutItemsContainer.innerHTML += `
        <div class="checkout-item">
            <div class="checkout-item-name">${item.name} x ${item.count}
            <span class="checkout-item-remove" id="checkout-item-remove-${uuidv4()}" data-itemid="${item.id}">remove</span></div>
            <div class="checkout-item-price">£${item.price * item.count}</div>
        </div>
        `
    totalPrice += item.price * item.count
    
    })
    if(totalPrice === 0){
         checkout.classList.toggle("hidden")
         currentOrder = []
     } else {
         checkoutTotalPrice.innerHTML = `
        <p>Total Price: </p>
        <div>£${totalPrice}</div>
        `
        document.getElementById('checkout-btn').innerHTML = `
        <div>
            <button class="all-btn all-btn-text" id="checkout-btn">Complete Order</button>
        </div>
        `
     }
}

function handleRemoveItemClick(itemUuid, itemId){
    document.getElementById(itemUuid).parentElement.parentElement.remove()
    const item = currentOrder.findIndex(item => item.id === itemId)
    
    totalPrice -= currentOrder[item].price * currentOrder[item].count
    currentOrder.splice(item,1)
    checkoutTotalPrice.textContent = totalPrice
    document.querySelector(`#minus-btn-${itemId}`).classList.toggle("hidden")
    checkoutTotalPrice.innerHTML = `
        <p>Total Price: </p>
        <div>£${totalPrice}</div>
        `
    if(totalPrice === 0){
        checkout.classList.toggle("hidden")
        currentOrder = []
    }
}



function handleCompleteOrderClick() {
    paymentModal.style.display="flex"
    paymentModal.innerHTML = `
    <div class="payment-modal-content">
        <h1 class="payment-title" >Please enter your card details</h1>
        
        <form class="payment-form" id="payment-form">
            <input class="payment-input" type="text" id="payment-name" placeholder="Enter your name" required>
            <input class="payment-input" id="cc-input" type="tel" placeholder="Enter card number" required minlength="16" maxlength="16" pattern="[0-9]*">
            <input class="payment-input" type="tel" placeholder="Enter CVV" required minlength="3" maxlength="3" pattern="[0-9]*">
            <div class="payment-icons-container">
                <i class="fa-brands fa-cc-visa payment-icons"></i>
                <i class="fa-brands fa-cc-mastercard payment-icons"></i>
            </div>
            <button class="all-btn all-btn-text">Pay</button>
        </form>
    </div>
    `
    const paymentForm = document.getElementById('payment-form')
    paymentForm.addEventListener('submit', function(e){
        e.preventDefault()
        const paymentFormData = new FormData(paymentForm)
        paymentFormData.append("text", document.getElementById("payment-name").value)
        paymentModal.style.display="none"
        renderSuccess(paymentFormData.get('text'))
    })
}

function renderSuccess(name){
    successModal.style.display="flex"
    successModal.innerHTML = `
    <div class="success-modal-content">
        <p class="success-thanks-text">Thanks, ${name}! 😊</p>
        <p class="success-order-text">Your payment was successful and your order is on it's way!</p>
        <div class="success-rating-container">
            <p class="success-order-text">How did we do today?</p>
            <div class="success-rating-icons">
                <input type="radio" name="rating" value="5" id="5"><label for="5">☆</label>
                <input type="radio" name="rating" value="4" id="4"><label for="4">☆</label>
                <input type="radio" name="rating" value="3" id="3"><label for="3">☆</label>
                <input type="radio" name="rating" value="2" id="2"><label for="2">☆</label>
                <input type="radio" name="rating" value="1" id="1"><label for="1">☆</label>
            </div>
        </div>
        <button class="all-btn all-btn-text" id="succes-modal-btn">Continue</button>
    </div>
    `
}

function handleContinueClick(){
    successModal.style.display = "none"
    checkout.classList.toggle("hidden")
    currentOrder = []
    renderMenuItems()
}
