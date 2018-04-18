import ObjectLoader from "./object-loader.js";

export default class DynamicObjectLoader extends ObjectLoader {
    constructor(loader, options) {
        super(loader, options);
    }

    addTexture(tex) {
        super.addTexture(this.loader.getTexture(1000, 2000, 3000, 5000));

        //this.renderObj.regX = -1000;
        //this.renderObj.regY = -1000;
    }
}
