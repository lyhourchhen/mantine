import React, { useState, useRef, useEffect } from 'react';
import cx from 'clsx';
import { useReducedMotion, useClickOutside, useFocusTrap } from '@mantine/hooks';
import { DefaultProps, MantineNumberSize, mergeStyles, useMantineTheme } from '../../../theme';
import { Transition, MantineTransition } from '../../Transition/Transition';
import { Paper } from '../../Paper/Paper';
import { Divider } from '../../Divider/Divider';
import { Text } from '../../Text/Text';
import { MenuItem, MenuItemType } from '../MenuItem/MenuItem';
import { MenuLabel } from '../MenuLabel/MenuLabel';
import { MenuButton, MenuButtonStylesNames } from '../MenuButton/MenuButton';
import useStyles from './MenuBody.styles';

export type MenuBodyStylesNames = keyof ReturnType<typeof useStyles> | MenuButtonStylesNames;

export interface MenuBodyProps
  extends DefaultProps<MenuBodyStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  /** When true menu is mounted to the dom */
  opened: boolean;

  /** Triggers when menu is closed */
  onClose(): void;

  /** <MenuItem /> and <Divider /> components only */
  children: React.ReactNode;

  /** Transition styles */
  transition?: MantineTransition;

  /** Transitions duration in ms */
  transitionDuration?: number;

  /** Transition timing function */
  transitionTimingFunction?: string;

  /** Predefined menu width or number for width in px */
  size?: MantineNumberSize;

  /** Predefined shadow from theme or box-shadow value */
  shadow?: string;

  /** Should menu close on outside click */
  closeOnClickOutside?: boolean;

  /** Should menu close on item click */
  closeOnItemClick?: boolean;

  /** Menu body z-index */
  zIndex?: number;

  /** Body border-radius */
  radius?: MantineNumberSize;

  /** Trap focus inside menu */
  trapFocus?: boolean;
}

function getNextItem(active: number, items: MenuItemType[]) {
  for (let i = active + 1; i < items.length; i += 1) {
    if (!items[i].props.disabled && items[i].type === MenuItem) {
      return i;
    }
  }

  return active;
}

function findInitialItem(items: MenuItemType[]) {
  for (let i = 0; i < items.length; i += 1) {
    if (!items[i].props.disabled && items[i].type === MenuItem) {
      return i;
    }
  }

  return -1;
}

function getPreviousItem(active: number, items: MenuItemType[]) {
  for (let i = active - 1; i >= 0; i -= 1) {
    if (!items[i].props.disabled && items[i].type === MenuItem) {
      return i;
    }
  }

  if (!items[active] || items[active].type !== MenuItem) {
    return findInitialItem(items);
  }

  return active;
}

export function MenuBody({
  className,
  style,
  themeOverride,
  opened,
  onClose,
  transition = 'skew-up',
  transitionDuration = 250,
  transitionTimingFunction,
  children,
  size = 'md',
  shadow = 'md',
  closeOnClickOutside = true,
  closeOnItemClick = true,
  zIndex = 1000,
  classNames,
  styles,
  radius,
  trapFocus = true,
  ...others
}: MenuBodyProps) {
  const items = React.Children.toArray(children).filter(
    (item: MenuItemType) =>
      item.type === MenuItem || item.type === Divider || item.type === MenuLabel
  ) as MenuItemType[];

  const hoveredTimeout = useRef<number>();
  const buttonsRefs = useRef<Record<string, HTMLButtonElement>>({});
  const theme = useMantineTheme(themeOverride);
  const classes = useStyles({ size, theme }, classNames as any, 'menu');
  const _styles = mergeStyles(classes, styles as any);
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : transitionDuration;
  const [hovered, setHovered] = useState(findInitialItem(items));
  const focusTrapRef = useFocusTrap(trapFocus);

  useEffect(() => {
    if (!opened) {
      hoveredTimeout.current = window.setTimeout(() => {
        setHovered(findInitialItem(items));
      }, duration);
    } else {
      window.clearTimeout(hoveredTimeout.current);
    }

    return () => window.clearTimeout(hoveredTimeout.current);
  }, [opened]);

  const menuRef = useClickOutside(() => closeOnClickOutside && onClose());

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { code } = event.nativeEvent;

    if (code === 'Escape') {
      onClose();
    }

    if (code === 'Tab' && trapFocus) {
      event.preventDefault();
    }

    if (code === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = getPreviousItem(hovered, items);
      setHovered(prevIndex);
      buttonsRefs.current[prevIndex].focus();
    }

    if (code === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = getNextItem(hovered, items);
      setHovered(nextIndex);
      buttonsRefs.current[nextIndex].focus();
    }
  };

  if (items.length === 0) {
    return null;
  }

  const buttons = items.map((item, index) => {
    if (item.type === MenuItem) {
      return (
        <MenuButton
          {...item.props}
          key={index}
          hovered={hovered === index}
          onHover={() => setHovered(index)}
          radius={radius}
          classNames={classNames as any}
          styles={styles as any}
          onClick={(event: any) => {
            if (closeOnItemClick) {
              onClose();
            }

            if (typeof item.props.onClick === 'function') {
              item.props.onClick(event);
            }
          }}
          elementRef={(node: any) => {
            buttonsRefs.current[index] = node;
          }}
        />
      );
    }

    if (item.type === MenuLabel) {
      return (
        <Text
          className={classes.label}
          style={_styles.label}
          {...(item.props as any)}
          key={index}
        />
      );
    }

    if (item.type === Divider) {
      return (
        <Divider
          variant="solid"
          className={classes.divider}
          margins={theme.spacing.xs / 2}
          style={_styles.divider}
          key={index}
        />
      );
    }

    return null;
  });

  return (
    <Transition
      mounted={opened}
      duration={duration}
      transition={transition}
      timingFunction={transitionTimingFunction}
      themeOverride={themeOverride}
    >
      {(transitionStyles) => (
        <Paper
          shadow={shadow}
          className={cx(classes.body, className)}
          style={{ ...style, ..._styles.body, ...transitionStyles, zIndex }}
          onKeyDownCapture={handleKeyDown}
          elementRef={menuRef}
          role="menu"
          aria-orientation="vertical"
          radius={radius}
          onMouseLeave={() => setHovered(-1)}
          {...others}
        >
          <div ref={focusTrapRef}>{buttons}</div>
        </Paper>
      )}
    </Transition>
  );
}

MenuBody.displayName = '@mantine/core/MenuBody';
