Entry.skeleton.basic_create_value = {
    executable: true,
    path(blockView) {
        // 1. Calculate Robust Width
        let topWidth = 0;
        let bottomWidth = 0;
        (blockView._contents || []).forEach((c) => {
            if (c.box) {
                const rightEdge = c.box.x + c.box.width;
                if (c.box.y < 10) {
                    topWidth = Math.max(topWidth, rightEdge);
                } else {
                    bottomWidth = Math.max(bottomWidth, rightEdge);
                }
            }
        });

        topWidth = Math.max(150, topWidth + 10);
        bottomWidth = Math.max(150, bottomWidth + 10);

        // 2. Calculate Statement Height
        const statements = blockView._statements || [];
        let statementHeight = (statements[0] && statements[0].height) || 30;
        statementHeight = Math.max(30, statementHeight);

        // 3. Define geometry
        const adjustedHeight = statementHeight;

        return `M 0 0                
                V 1
                h ${topWidth}
                a 14 14 0 0 1 0 28
                H 26
                l -6 6
                l -6 -6
                v ${adjustedHeight}
                l 6 6
                l 6 -6
                h ${bottomWidth - 26}
                a 14 14 0 0 1 0 28
                H 0
                z`;
    },
    magnets(blockView) {
        return {};
    },
    box(blockView) {
        // Match Width logic
        let width = blockView.contentWidth || 150;
        width = Math.max(150, width + 10);

        const statements = blockView._statements || [];
        let statementHeight = (statements[0] && statements[0].height) || 30;
        statementHeight = Math.max(30, statementHeight);

        // Reduce total height slightly to match the path adjustment
        const totalHeight = 30 + statementHeight + 30;

        return {
            offsetX: -8,
            offsetY: 0,
            width: width + 30, // Hitbox padding
            height: totalHeight,
            marginBottom: 0,
        };
    },
    statementPos(blockView) {
        // Statement starts immediately after Top Bar
        return [{ x: 14, y: 30 }];
    },
    contentPos(blockView) {
        // Content (Function Name) MUST start in the Top Bar.
        // Center of Top Bar (30px) is 15px.
        return { x: 14, y: 15 };
    },
    lineBreakPos(blockView) {
        const statements = blockView._statements || [];
        let statementHeight = (statements[0] && statements[0].height) || 30;
        statementHeight = Math.max(30, statementHeight);
        return statementHeight + 28;
    },
};
