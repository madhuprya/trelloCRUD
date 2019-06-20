var token = "70f361bbb63ef8ef719f5adbf766703d555b775d69e9f368b4af1d0894581f59";
var key = "528ef6da60343fa8086bac0831fd43aa";
var trelloId = "uG0ypKxz";

var endpoints = `https://api.trello.com/1/boards/${trelloId}/lists?key=${key}&token=${token}`;
function getBoardList(bInd) {
    fetch(endpoints)
        .then(response => response.json())
        .then(data => data.map(list => list))
        .then(data => getCardLists(data[bInd]));
}

function getCardLists(data) {
    $("#trello-board>p").css({
        "text-align":"center",
        "font-weight":"bold",
        "font-size":"3em"
    })
    fetch(`https://api.trello.com/1/lists/${data['id']}/cards?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data.map(list => list))
        .then(data => {
            data.map(data => {
               var listId=data.id+"madhu";
                 //console.log(listId);
                $("#trello-board").append(`<div id="${data.id}">${data.name}</div>`).css({
                    "background-color": "#D0D9DB",
                    "border": "1px solid green",
                    "width":"1000px",
                    "margin":"auto",
                }).height("auto");
                $(`#${data.id}`).css({
                    "color":"red",
                    "font-size":"1.5em"
                })
                getOptions(data,listId);
              
            })
        });
}

function getOptions(data,listId) {
    var card = data.id;
    //console.log(card);
    $(`#${card}`).append(`<select name="${card}" class="${card}"></select>`)
    $(`.${card}`).css({
        "background-color":"#DFF2F2",
        "padding":"10px",
        "margin-left":"50px",
        "font-size":"0.8em"
    }).height("20px");
    $(`#${card}`).append(`<ul id="${listId}"></ul>`).css({
        "margin-top": "10px",
        "background-color": "azure"
    }).height("auto");

    $(`#${listId}`).css({
        "background-color": "#DFF2F2"
        }).height("800px");
    fetch(`https://api.trello.com/1/cards/${card}/checklists?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data.map(list => list['checkItems']))
        .then(data => data.reduce((accumulator, item) => {
            item.map(i => accumulator.push(i));
            return accumulator;
        }, []))
        .then(data => {generateCheckitems(data,listId,card);console.log()});

    fetch(`https://api.trello.com/1/cards/${card}/checklists?key=${key}&token=${token}`)
        .then(response => response.json())
        .then(data => data.map(data => {
            let option = `<option value=${data['id']}>${data["name"]}</option>`;
            $(`.${card}`).append(option);
        }))
}


getBoardList(2);

/******************* DOM MANIPULATION******************/



function generateCheckitems(items,id,card) {
    items.map(item => { 
     //  console.log(id)
       getItems(item,id,card);
    });
    /******************* DOM MANIPULATION FETCH "GET" ******************/
    function getItems(item,id,card) {
        let list = `<li class="checkitem"><input class="check-items" id=${item.id} type="checkbox"><a>${item.name}</a><button class="btn"  id=${item.id} type="button">&times;</button></li>`;

        $(`#${id}`).append(list).css({
            "list-style": "none",
            "background-color": "#d9eaad",
            "font-size": "20px",
            "padding": "100px 100px",
            "margin": "100px 0px",
            "cursor": "pointer"
        }).height("auto").width("600px");
        $(".checkitem").css({
            "display":"flex",
            "flex-flow":"rwo nowrap",
            "justify-content":"space-between",
            "margin-top":"5px"
        })
       // console.log(cardId);
        fetch(`https://api.trello.com/1/cards/${card}/checkItem/${item.id}/`)
            .then(response => response.json())
        //    .then(data=>console.log(data));
            .then((Object) => {
                (Object["state"] === "complete") ?
                $(`#${item.id}`).prop("checked", true) &&
                    $(`#${item.id}`).next().css({
                        "text-decoration": "line-through",
                        "color": "gray"
                    }):
                    $(`#${item.id}`).prop("checked", false) &&
                    $(`#${item.id}`).next().css({
                        "text-decoration": "none"
                    })
            });

        $("#check-lists>li").css({
            "display": "flex",
            "flex-flow": "row nowrap",
            "justify-content": "space-between",
            "color": "red",
            "cursor": "pointer",
            "margin-top": "10px"
        });
        $("button").css({
            "background-color": "azure",
            "cursor": "pointer",
            "border-style": "none",
            "outline": "none",
            "color": "green",

        })
    }
    /*************************DOM MANIPULATION UPDATE "PUT" ********************************* */
    $(".check-items").on("click", function () {
        if ($(this).is(':checked')) {
            fetch(`https://api.trello.com/1/cards/${card}/checkItem/${this.id}?state=complete&key=${key}&token=${token}`, {
                    method: 'PUT'
                })
                .then(data => data.json())
                .then((Object) => {
                    Object["state"] = "complete"
                })
                .then(() => $(`#${this.id}`).next().css({
                    "text-decoration": "line-through",
                    "color": "gray"
                }))
        } else {
            fetch(`https://api.trello.com/1/cards/${card}/checkItem/${this.id}?state=incomplete&key=${key}&token=${token}`, {
                    method: 'PUT'
                })
                .then(data => data.json())
                .then((Object) => {
                    Object["state"] = "incomplete"
                })
                .then(() => $(`#${this.id}`).next().css({
                    "text-decoration": "none",
                    "color": "red"
                }))
        }
    });

    // /******************* DOM MANIPULATION REMOVE "DELETE" ******************/
    $(".btn").on("click", function () {
        fetch(`https://api.trello.com/1/cards/${card}/checkItem/${this.id}?key=${key}&token=${token}`, {
                method: 'DELETE'
            })
            .then(() => $(this).parent().remove() && $(this).parent().next().remove());
    })

    // /**************************DOM MANIPULATION CREATE "POST" ***************************** */

    let create = `<li><input class="chk" id="item" type=""><button class="chk" id="add">ADD ITEMS</button><li>`
    $(`#${id}`).prepend(create)
    $("#select").css({
        "position": "absolute",
        "top": "200px",
        "left": "500px"
    })
    $("#add").css({
        "cursor": "pointer",
        "border-radius": "50px",
        "background-color": "azure",
        "color": "green",
        "border-style": "none",
        "outline": "none",
        "padding": "5px",
        "margin-left": "10px"
    })
    $("#item").css({
        "width": "300px",
        "outline": "none",
        "padding": "5px",
        "color": "red"
    })
    $("#select").css({
        "background-color": "azure",
        "border-style": "none",
        "height": "30px"

    })
    $("#add").on("click", function () {
        var s = document.getElementsByName(`${card}`)[0];
        s.addEventListener("change", value);
        var value = s.options[s.selectedIndex].value;
        var input = $("#item").val();
        fetch(`https://api.trello.com/1/checklists/${value}/checkItems?name=${input}&pos=bottom&checked=false&key=${key}&token=${token}`, {
                method: 'POST'
            }).then(res => res.json())
            .then(data => getItems(data,id,card))

    })

}