Entry.FieldLineBreak = class FieldLineBreak extends Entry.Field {
    constructor(content, blockView, index) {
        super();
        this._block = blockView.block;
        this._blockView = blockView;
        this._index = index;

        const box = new Entry.BoxModel();
        this.box = box;

        this.setValue(null);
        this.renderStart();
    }
    renderStart() {
        return;
    }

    align(targetStatementIndex) {
        const blockView = this._blockView;

        if (blockView._statements.length === 0) {
            return;
        }

        const skeleton = blockView.getSkeleton();
        if (skeleton && typeof skeleton.lineBreakPos === 'function') {
            const pos = skeleton.lineBreakPos(blockView);
            if (pos !== undefined && pos !== null) {
                this.box.set({ y: pos.y !== undefined ? pos.y : pos });
                return;
            }
        }

        this.box.set({
            y:
                (blockView._statements[targetStatementIndex].height || 20) +
                Math.max(blockView.contentHeight % 1000, 30),
        });
    }
};
