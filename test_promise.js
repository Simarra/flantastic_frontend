function delay(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

// Using delay():
delay(5000).then(function () {
    console.log('5 seconds have passed!')
});

console.log("COUCOU")