var token = "70f361bbb63ef8ef719f5adbf766703d555b775d69e9f368b4af1d0894581f59";
var key = "528ef6da60343fa8086bac0831fd43aa";
var trelloId = "uG0ypKxz";
/************************GET REQUEST*********************/

function getBoardList(bInd) {
    return fetch(`https://api.trello.com/1/boards/${trelloId}/lists?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data[bInd])
        .catch((error) => console.log(`Board List is not available${error}`));
}

function getCardLists(boardId) {
    return fetch(`https://api.trello.com/1/lists/${boardId}/cards?key=${key}&token=${token}`)
        .then(response => response.json())
        .catch((error) => console.log(`Card List is not available${error}`));
}

function getCheckLists(cardId) {
    // console.log(cardId);
    return fetch(`https://api.trello.com/1/cards/${cardId}/checklists?key=${key}&token=${token}`)
        .then(response => response.json())
        .catch((error) => console.log(`Check List is not available${error}`));
}

function getCheckitems(checklistId) {
    //console.log(checklistId)
    return fetch(`https://api.trello.com/1/checklists/${checklistId}/checkItems?key=${key}&token=${token}`)
        .then((response) => response.json())
        .catch((error) => console.log(`Check item is not available${error}`));
}
/***************************DOM ELEMENT*****************************/
function CardsDomElem(cards) {
    cards.forEach(card => {
        let cardDiv = `<div id=${card["id"]}>${card["name"]}</div>`;
        let checklistDropdown = `<select name="${card["id"]}" class="${card["id"]}"></select>`;
        let createCheckItem = `<div><input id="item" type=""><button class="add">ADD ITEMS</button><div>`

        $("#trello-board").append(cardDiv);
        $(`#${card["id"]}`).append(checklistDropdown);
        $(`#${card["id"]}`).append(createCheckItem);
    })

}

function CheckListsDomElem(checklists) {
    checklists.forEach(checklist => {
        $(`#${checklist['idCard']}`).attr("idcard", checklist['idCard']);
        let checkItemList = `<ul id="${checklist['id'] }" idcard="${checklist['idCard']}"></ul>`
        $(`#${checklist['idCard']}`).append(checkItemList);
        let checkListOption = `<option value=${checklist['id']}>${checklist["name"]}</option>`;
        $(`.${checklist['idCard']}`).append(checkListOption);
    })
    createNewItems();

}

function CheckItemsDomElem(checkitems) {
    checkitems.forEach(checkitem => {
        $(`#${checkitem['idChecklist']}`).attr("itemid", checkitem.id);
        let id = "i" + checkitem.id;
        let checkItem = `<li class="checkitem"><input class="check-items" itemid="${checkitem.id}" id="${id}" type="checkbox"><a data-editable class="check-edit"  id=${checkitem.id}>${checkitem.name}</a><button class="btn" itemid="${checkitem.id}"  type="button">&times;</button></li>`;
        $(`#${checkitem["idChecklist"]}`).append(checkItem);
        if (checkitem["state"] === "complete") {
            $(`#${id}`).prop("checked", true) &&
                $(`#${checkitem.id}`).css({
                    "text-decoration": "line-through",
                    "color": "gray"
                })
        } else {
            $(`#${id}`).prop("checked", false) &&
                $(`#${checkitem.id}`).css({
                    "text-decoration": "none",
                    "color": "red"
                })
        }

    })
    updateItemName();
    UpdateStatus();
    deleteItem();
}

/**********************************REST API CALL************************************** */
function updateItemName() {
    $('body').on('click', '[data-editable]', function (e) {
        let cardid = $(this).parent().parent().attr("idcard")
        var val;
        var $el = $(this);
        var $input = $('<input class="newVal"/>').val($el.text());
        $el.replaceWith($input);
        $input.keyup(function (event) {
            if (event.keyCode == 13) {
                val = $(".newVal").val();
                var $newval = $(`<a data-editable class="check-edit"  id=${e.target.id}/>`).text(val);
                fetch(`https://api.trello.com/1/cards/${cardid}/checkItem/${e.target.id}?name=${val}&key=${key}&token=${token}`, {
                        method: 'PUT'
                    })
                    .then(data => data.json())
                    .then(() =>$(".newVal").replaceWith($newval)
                    )
            }
        });
    })
}

function UpdateStatus() {
    $(".check-items").click(function (e) {
        let itemid = $(this).attr('itemid');
        let cardid = $(this).parent().parent().attr("idcard")
        if ($(this).is(':checked')) {
            fetch(`https://api.trello.com/1/cards/${cardid}/checkItem/${itemid}?state=complete&key=${key}&token=${token}`, {
                    method: 'PUT'
                })
                .then(data => data.json())
                .then((data) => {
                    data["state"] = "complete"
                })
                .then(() => $(`#${itemid}`).css({
                    "text-decoration": "line-through",
                    "color": "gray"
                }))
        } else {
            fetch(`https://api.trello.com/1/cards/${cardid}/checkItem/${itemid}?state=incomplete&key=${key}&token=${token}`, {
                    method: 'PUT'
                })
                .then(data => data.json())
                .then((data) => {
                    data["state"] = "incomplete"
                })
                .then(() => $(`#${itemid}`).css({
                    "text-decoration": "none",
                    "color": "red"
                }))
        }
    });

}

function deleteItem() {
    $(".btn").click(function (e) {
        let itemid = $(this).attr('itemid');
        let cardid = $(this).parent().parent().attr("idcard")
        fetch(`https://api.trello.com/1/cards/${cardid}/checkItem/${itemid}?key=${key}&token=${token}`, {
                method: 'DELETE'
            })
            .then(data => (data.json))
            .then(() => {
                $(this).parent().remove() && $(this).parent().next().remove()
            })
    })
}

function createNewItems() {

    $(".add").click(function (e) {
        let cardid = $(this).parent().parent().attr("id")
        var s = document.getElementsByName(`${cardid}`)[0];
        // s.addEventListener("change", value);
        var value = s.options[s.selectedIndex].value;
        var input = $(this).prev().val();
        let post = fetch(`https://api.trello.com/1/checklists/${value}/checkItems?name=${input}&pos=bottom&checked=false&key=${key}&token=${token}`, {
            method: 'POST'
        }).then(res => res.json())
        Promise.all([post])
            .then((data) => {
                CheckItemsDomElem(data);
            });
    })
}
/**********************************TRELLO CALL***************************** */
function TrelloCall() {
    let cards = getBoardList(2).then(board => {
        return getCardLists(board["id"]).then(cards => cards.map(card => card))
    });
    cardCall(cards);
}

function cardCall(cards) {
    let checklists = cards.then(cards => {
        return Promise.all(cards.map(v => getCheckLists(v["id"])))
    });
    let checklistsObj = checklists.then(v => v.flat())

    let checkItemObj = checklists.then(v => {
        let arrObj = v.flat();
        return Promise.all(arrObj.map(v => getCheckitems(v["id"])));
    })

    let checkitemObj = checkItemObj.then(v => v.flat())

    Promise.all([cards, checklistsObj, checkitemObj]).then((data) => {
        CardsDomElem(data[0]);
        CheckListsDomElem(data[1]);
        CheckItemsDomElem(data[2]);
    })

}
TrelloCall();