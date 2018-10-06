const roll = (params, message, userMessage) => {
    let min;
    let max;
    if (params.length > 1) {
        min = parseInt(params[0])
        max = parseInt(params[1])
    } else {
        let splitParam = typeof params[0] === 'string' ? params[0].split('-') : [params[0]];
        if (splitParam.length > 1) {
            max = parseInt(splitParam[1]);
            min = parseInt(splitParam[0]);
        } else {
            max = parseInt(params[0]) || 100;
            min = 1;
        }
    }
    if (typeof max === 'number' && typeof min === 'number' && max >= min) {
        const value = Math.floor(Math.random() * Math.floor(max - min + 1)) + min;
        return `${userMessage.author.username} rollasi: ${value} (${min}-${max})`;
    }
    return 'ny ei ollu numeroit tai maksimi oli pienempi kuin minimi'
}
export default roll