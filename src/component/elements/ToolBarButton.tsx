import { ButtonProps, Placement } from '@blueprintjs/core';
import { Button, ToolbarItemProps } from 'react-science/ui';

export interface ToolBarButtonProps
    extends Omit<ToolbarItemProps, 'onClick' | "title">,
    Pick<ButtonProps, 'onClick' | "title"> {
    disabled?: boolean;
    placement?: Placement
}

export function ToolBarButton(props: ToolBarButtonProps) {
    const { intent, title = "", placement = "bottom", ...other } = props;
    return (
        <Button
            {...other}
            intent={intent}
            minimal
            tooltipProps={{
                content: title,
                placement,
                intent,
                compact: true,
            }}
            style={{
                fontSize: '1.25em',
            }}
        />
    );
}
