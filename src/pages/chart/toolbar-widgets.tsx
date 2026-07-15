import { memo } from 'react';
import { ChartMode, DrawTools, ToolbarWidget } from '@deriv/deriv-charts';
import { useDevice } from '@deriv-com/ui';

type TToolbarWidgetsProps = {
    updateChartType: (chart_type: string) => void;
    updateGranularity: (updateGranularity: number) => void;
    position?: string | null;
    isDesktop?: boolean;
};

// Trimmed from profithubnewtool's toolbar-widgets.tsx: dropped StudyLegend,
// Views, and Share widgets (per session decision — standalone charts page
// doesn't need study search/save-as-view/social-share). Kept ChartMode
// (line/candle/area type + granularity) and DrawTools (drawing tools).
const ToolbarWidgets = ({ updateChartType, updateGranularity, position, isDesktop }: TToolbarWidgetsProps) => {
    const { isMobile } = useDevice();
    const validPosition = position === 'top' || position === 'bottom' ? position : 'top';

    return (
        <ToolbarWidget position={validPosition || (isMobile ? 'bottom' : null)}>
            <ChartMode portalNodeId='modal_root' onChartType={updateChartType} onGranularity={updateGranularity} />
            <DrawTools portalNodeId='modal_root' />
        </ToolbarWidget>
    );
};

export default memo(ToolbarWidgets);
