// script for jQueryLite

function $(sel) {
  //todo: handle null in methods
  const el = document.querySelector(sel)
  return {
    thisEl: function () {
      return el
    },
    addEvent: function (evName, evAction) {
      if (evName) el.addEventListener(evName, evAction)
      else return el
    },
    addClass: function (className) {
      if (className) el.classList.add(className)
      else return el.classList
    },
    removeClass: function (className) {
      if (className) el.classList.remove(className)
      else return el.classList
    },
    hasClass: function (className) {
      if (className) return el.classList.contains(className)
      else return el.classList
    },
    html: function (htmlString) {
      if (htmlString) el.innerHTML = htmlString
      else return el.innerHTML;
    },
    text: function (textString) {
      if (textString) el.innerText = textString
      return el.innerText;
    },
    append: function (element) {
      if (element) el.append(element)
      else return el
    },
    val: function (newVal) {
      if (newVal || newVal === '') el.value = newVal
      return el.value
    },
    disable: function(bool) {
      if (bool) el.disabled = bool
      else return el
    },
    children: function () {
      return el.children
    },
    prop: function (propertyName, value) {
      if (propertyName && value) el.propertyName = value
      else return propertyName
    }
  }
}

const $$ = (sel) => [...document.querySelectorAll(sel)];

// TODO:
// createElement
