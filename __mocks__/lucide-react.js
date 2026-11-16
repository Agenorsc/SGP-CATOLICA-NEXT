const React = require('react');

// Icons are decorative in the integration tests. Keep the real UI unchanged.
module.exports = new Proxy({}, {
  get(_target, name) {
    if (name === '__esModule') return true;
    if (name === 'default') return undefined;
    if (typeof name !== 'string') return undefined;
    const Icon = React.forwardRef(function MockLucideIcon(props, ref) {
      const { children, ...rest } = props;
      return React.createElement('svg', { ...rest, ref, 'data-testid': `icon-${name}` }, children);
    });
    Icon.displayName = `MockLucide${name}`;
    return Icon;
  },
});
