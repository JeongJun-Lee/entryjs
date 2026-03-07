import _floor from 'lodash/floor';

class LocalTree {
    constructor(props) {
        this.props = props;
        this.container = props.container;
        this.data = props.data || {};
        this.initialize();
    }

    initialize() {
        if (!this.container) {
            this.container = document.createElement('div');
            document.body.appendChild(this.container);
        }
        this.injectStyle();
        this.render();
    }

    injectStyle() {
        if (document.getElementById('entry-learning-tree-style')) return;
        const style = document.createElement('style');
        style.id = 'entry-learning-tree-style';
        style.innerHTML = `
            .entry-learning-tree-root .tree ul {
                padding-top: 20px; position: relative;
                transition: all 0.3s;
                display: flex;
                justify-content: center;
                margin: 0;
            }
            .entry-learning-tree-root .tree li {
                float: left; text-align: center;
                list-style-type: none;
                position: relative;
                padding: 20px 10px 0 10px;
                transition: all 0.3s;
            }
            .entry-learning-tree-root .tree li::before, .entry-learning-tree-root .tree li::after{
                content: '';
                position: absolute; top: 0; right: 50%;
                border-top: 1px solid #ccc;
                width: 50%; height: 20px;
            }
            .entry-learning-tree-root .tree li::after{
                right: auto; left: 50%;
                border-left: 1px solid #ccc;
            }
            .entry-learning-tree-root .tree li:only-child::after, .tree li:only-child::before {
                display: none;
            }
            .entry-learning-tree-root .tree li:only-child{ padding-top: 0;}
            .entry-learning-tree-root .tree li:first-child::before, .tree li:last-child::after{
                border: 0 none;
            }
            .entry-learning-tree-root .tree li:last-child::before{
                border-right: 1px solid #ccc;
                border-radius: 0 5px 0 0;
            }
            .entry-learning-tree-root .tree li:first-child::after{
                border-radius: 5px 0 0 0;
            }
            .entry-learning-tree-root .tree ul ul::before{
                content: '';
                position: absolute; top: 0; left: 50%;
                border-left: 1px solid #ccc;
                width: 0; height: 20px;
            }
            .entry-learning-tree-root .tree li a{
                border: 1px solid #ccc;
                padding: 12px 18px;
                text-decoration: none;
                color: #333;
                font-family: inherit;
                font-size: 13px;
                display: inline-block;
                border-radius: 6px;
                transition: all 0.2s;
                background: #fff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
            .entry-learning-tree-root .tree li a b {
                display: block;
                font-size: 14px;
                margin-bottom: 2px;
                color: #111;
            }
            .entry-learning-tree-root .tree li .label-box {
                position: absolute;
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                background: #fff;
                padding: 2px 10px;
                border: 1px solid #ccc;
                border-radius: 12px;
                font-size: 11px;
                color: #555;
                font-weight: 600;
                z-index: 10;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .entry-learning-tree-root .tree li a:hover {
                background: #f0f4f8; 
                color: #1a73e8; 
                border: 1px solid #1a73e8;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    setData(data) {
        this.data = data;
        this.render();
    }

    show() { if (this.dom) this.dom.style.display = 'block'; }
    hide() { if (this.dom) this.dom.style.display = 'none'; }

    destroy() {
        if (this.dom && this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom);
        }
    }

    render() {
        const { source, title } = this.data;
        if (!source) return;

        // Use localized strings if available
        const langTitle = (typeof Lang !== 'undefined' && Lang.AiLearning?.tree_title) || 'Decision Tree';
        const displayTitle = title || langTitle;

        const html = `
            <div class="entry-learning-tree-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999;"></div>
            <div class="entry-learning-tree-modal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 92%; height: 85%; background: #ffffff; z-index: 10000; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; animation: entry-tree-appear 0.3s ease-out;">
                <style>
                    @keyframes entry-tree-appear { from { opacity: 0; transform: translate(-50%, -48%) scale(0.98); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
                </style>
                <div class="entry-learning-tree-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid #edf2f7; background: #ffffff;">
                    <h2 style="margin: 0; font-size: 1.4rem; font-weight: 700; color: #2d3748; letter-spacing: -0.02em;">${displayTitle}</h2>
                    <button class="entry-learning-tree-close" style="background: #edf2f7; border: none; font-size: 1.5rem; cursor: pointer; color: #4a5568; line-height: 1; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">&times;</button>
                </div>
                <div class="entry-learning-tree-content" style="flex: 1; overflow: auto; padding: 0; background: #f7fafc; position: relative;-webkit-overflow-scrolling: touch;">
                    <div class="tree-inner-wrapper" style="min-width: 100%; min-height: 100%; display: inline-flex; justify-content: center; align-items: flex-start;">
                        <div class="tree" style="padding: 80px 100px; display: inline-block;">
                            <ul>${this.drawTree(source, '')}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (this.dom) {
            this.dom.innerHTML = html;
            this.dom.style.display = 'block';
        } else {
            this.dom = document.createElement('div');
            this.dom.className = 'entry-learning-tree-root';
            this.dom.innerHTML = html;
            this.container.appendChild(this.dom);
        }

        const closeBtn = this.dom.querySelector('.entry-learning-tree-close');
        const overlay = this.dom.querySelector('.entry-learning-tree-overlay');
        const handleClose = () => {
            if (this.props.onClose) this.props.onClose();
            else this.hide();
        };
        if (closeBtn) {
            closeBtn.onclick = handleClose;
            closeBtn.onmouseover = () => { closeBtn.style.background = '#e2e8f0'; closeBtn.style.color = '#1a202c'; };
            closeBtn.onmouseout = () => { closeBtn.style.background = '#edf2f7'; closeBtn.style.color = '#4a5568'; };
        }
        if (overlay) overlay.onclick = handleClose;
    }

    drawTree(source, labelPrefix = '') {
        const { graphData, fields, valueMap, yes, no } = source;
        if (!graphData) return '';
        const { splitColumn, splitValue, distribution, left, right } = graphData;

        const yesLabel = yes || 'yes';
        const noLabel = no || 'no';

        let feature = null;
        let prediction = null;
        if (graphData.featureName !== undefined) {
            feature = graphData.featureName;
        } else if (splitColumn !== null && splitColumn !== undefined) {
            feature = fields[splitColumn + 1] || fields[splitColumn] || `Col ${splitColumn}`;
        }
        if (graphData.predictionLabel !== undefined) {
            prediction = graphData.predictionLabel;
        } else if (distribution !== null && distribution !== undefined) {
            let d = distribution.data ? distribution.data : distribution;
            while (Array.isArray(d) && d.length === 1) {
                d = d[0];
            }
            if (typeof d === 'object' && d !== null) {
                let bestClass = -1;
                let maxProb = -Infinity;
                for (const [k, v] of Object.entries(d)) {
                    if (Number(v) > maxProb) {
                        maxProb = Number(v);
                        bestClass = Number(k);
                    }
                }
                if (bestClass !== -1) {
                    let lbl = valueMap[bestClass + 1] !== undefined ? valueMap[bestClass + 1] : valueMap[bestClass];
                    if (lbl !== undefined && lbl !== null && lbl !== '') {
                        prediction = lbl;
                    }
                }
            }
        }

        const isLeafNode = !left && !right || (Object.keys(left || {}).length === 0 && Object.keys(right || {}).length === 0);
        let labelHtml = labelPrefix ? `<div class="label-box">${labelPrefix}</div>` : '';

        if (isLeafNode) {
            const predLabel = prediction !== undefined && prediction !== null ? prediction : 'Leaf';
            return `
                <li>
                    ${labelHtml}
                    <a href="javascript:void(0);" style="border-top: 4px solid #48bb78; min-width: 120px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <b style="color: #2f855a;">${predLabel}</b>
                    </a>
                </li>
            `;
        }

        return `
            <li>
                ${labelHtml}
                <a href="javascript:void(0);" style="background: #ffffff; border: 1px solid #e2e8f0; font-weight: 700; color: #4a5568;">
                    ${feature} < ${typeof splitValue === 'number' ? _floor(splitValue, 2) : splitValue}
                </a>
                <ul>
                    ${this.drawTree({ graphData: left, fields, valueMap, yes: yesLabel, no: noLabel }, yesLabel)}
                    ${this.drawTree({ graphData: right, fields, valueMap, yes: yesLabel, no: noLabel }, noLabel)}
                </ul>
            </li>
        `;
    }
}

export default LocalTree;
