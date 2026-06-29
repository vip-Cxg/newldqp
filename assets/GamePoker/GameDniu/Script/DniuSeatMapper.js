const DEFAULT_PERSON = 8;

class DniuSeatMapper {
    constructor(person) {
        this.person = person || DEFAULT_PERSON;
        this.selfIdx = -1;
        this.observer = true;
    }

    setContext(selfIdx, person, observer) {
        this.person = person || this.person || DEFAULT_PERSON;
        this.selfIdx = selfIdx == null ? -1 : Number(selfIdx);
        this.observer = observer === true || this.selfIdx < 0;
    }

    toViewIndex(serverIdx) {
        serverIdx = Number(serverIdx);
        if (isNaN(serverIdx)) return -1;
        if (this.observer || this.selfIdx < 0) {
            return serverIdx;
        }
        return (serverIdx - this.selfIdx + this.person) % this.person;
    }

    toServerIndex(viewIndex) {
        viewIndex = Number(viewIndex);
        if (isNaN(viewIndex)) return -1;
        if (this.observer || this.selfIdx < 0) {
            return viewIndex;
        }
        return (this.selfIdx + viewIndex) % this.person;
    }

    isSelf(serverIdx) {
        return !this.observer && this.selfIdx >= 0 && Number(serverIdx) === this.selfIdx;
    }

    buildServerToViewMap() {
        let map = [];
        for (let serverIdx = 0; serverIdx < this.person; serverIdx++) {
            map[serverIdx] = this.toViewIndex(serverIdx);
        }
        return map;
    }
}

module.exports = DniuSeatMapper;
