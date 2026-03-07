import { BillBoard } from '@entrylabs/tool';
import Tree from './LocalTree';

export default class LearningChart {
    constructor(modalData, type = 'chart') {
        if (type === 'tree') {
            this.modal = this.createTree(modalData);
        } else {
            this.modal = this.createChart(modalData);
        }
        // LocalTree doesn't need explicit show() if it renders immediately,
        // but we'll call it for consistency if needed.
        if (this.modal.show) {
            this.modal.show();
        }
    }

    show() {
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    destroy() {
        if (this.modal) {
            if (typeof this.modal.destroy === 'function') {
                this.modal.destroy();
            } else if (typeof this.modal.hide === 'function') {
                this.modal.hide();
            }
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }
        this.modal = null;
        this.container = null;
    }

    load(data) {
        this.modal.setData(data);
    }

    createChart({ title = '', description = '', source }) {
        const container = Entry.Dom('div', {
            class: 'entry-learning-chart',
            parent: $(Entry.modalContainer),
        })[0];
        this.container = container;

        return new BillBoard({
            data: {
                source,
                title,
                description,
                togglePause: () => Entry.engine.togglePause(),
                stop: () => Entry.engine.toggleStop(),
                isIframe: self !== top,
            },
            container,
        });
    }

    createTree({ title = '', source }) {
        const container = Entry.Dom('div', {
            class: 'entry-learning-chart',
            parent: $(Entry.modalContainer),
        })[0];
        this.container = container;

        return new Tree({
            data: {
                source,
                title,
                width: 1100,
                minWidth: 1100,
                togglePause: () => Entry.engine.togglePause(),
                stop: () => Entry.engine.toggleStop(),
                isIframe: self !== top,
            },
            container,
        });
    }
}
