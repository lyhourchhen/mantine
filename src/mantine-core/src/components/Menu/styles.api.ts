import type { MenuBodyStylesNames } from './MenuBody/MenuBody';

export const Menu: Record<MenuBodyStylesNames, string> = {
  body: 'Menu body',
  divider: 'Divider inside menu body',
  label: 'Menu label wrapper (Text component)',
  item: 'MenuItem root element',
  itemHovered: 'MenuItem hovered modifier',
  itemInner: 'MenuItem inner (wraps itemIcon and itemBody)',
  itemBody: 'MenuItem body (wraps itemLabel and rightSection)',
  itemIcon: 'MenuItem icon',
  itemLabel: 'MenuItem label',
};
