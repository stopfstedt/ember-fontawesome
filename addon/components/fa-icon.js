/*eslint no-console: ["error", { allow: ["warn"] }] */
import Component from '@ember/component'
import layout from '../templates/components/fa-icon'
import { icon, parse, toHtml, config } from '@fortawesome/fontawesome-svg-core'
import { htmlSafe } from '@ember/string'
import { computed, get } from '@ember/object'
import { assign } from '@ember/polyfills';
import appConfig from 'ember-get-config';
import { deprecate } from '@ember/debug';

function getWithDefault (object, key, defaultValue) {
  let value = get(object, key);
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}

function getConfigOption (key, defaultValue) {
  return getWithDefault(appConfig, `fontawesome.${key}`, defaultValue);
}

function objectWithKey (key, value) {
  return ((Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && value)) ? {[key]: value} : {}
}

function classList () {
  let classes = {
    'fa-spin': this.get('spin'),
    'fa-pulse': this.get('pulse'),
    'fa-fw': this.get('fixedWidth'),
    'fa-border': this.get('border'),
    'fa-li': this.get('listItem'),
    'fa-flip-horizontal': this.get('flip') === 'horizontal' || this.get('flip') === 'both',
    'fa-flip-vertical': this.get('flip') === 'vertical' || this.get('flip') === 'both',
    [`fa-${this.get('size')}`]: getWithDefault(this, 'size', null) !== null,
    [`fa-rotate-${this.get('rotation')}`]: getWithDefault(this, 'rotation', null) !== null,
    [`fa-pull-${this.get('pull')}`]: getWithDefault(this, 'pull', null) !== null
  }

  return Object.keys(classes)
    .map(key => classes[key] ? key : null)
    .filter(key => key)
}

function normalizeIconArgs (prefix, icon) {
  const defaultPrefix = getConfigOption('defaultPrefix', 'fas');

  if (!icon) {
    return { prefix: defaultPrefix, iconName: null };
  }

  if (typeof icon === 'object' && icon.prefix && icon.iconName) {
    return icon
  }

  if(typeof prefix === 'string' && typeof icon === 'string'){
    return { prefix: prefix, iconName: icon }
  }

  if (typeof icon === 'string') {
    return { prefix: defaultPrefix, iconName: icon }
  }
}

const IconComponent = Component.extend({
  init() {
    this._super(...arguments);
    if (this.params && this.params.length) {
      deprecate(
        'Passing the icon as a position param is deprecated and will be removed in v1.0.0.',
        false,
        {
          id: '@fortawesome/ember-fontawesome.no-positional-params',
          until: '1.0.0',
          url: 'https://github.com/FortAwesome/ember-fontawesome#template'
        }
      );
    }
  },
  layout,
  tagName: 'svg',
  classNameBindings: ['allClasses'],
  attributeBindings: [
    // attributes watched for mutation
    'data-prefix',
    'data-icon',
    'data-fa-transform',
    'data-fa-mask',
    'data-fa-processed',
    // accessibility attributes
    'aria-hidden',
    'aria-labelledby',
    'focusable',
    // svg attributes
    'role',
    'xmlns',
    'viewBox',
    'safeStyle:style',
  ],
  html: computed('abstractIcon.children.[]', function() {
    const abstractIcon = this.get('abstractIcon');
    let newHtml;
    if(!abstractIcon){
      newHtml = htmlSafe('')
    } else {
      newHtml = htmlSafe(abstractIcon.children.reduce((acc,cur) => {
        return `${acc}${toHtml(cur)}`
      },''))
    }
    return newHtml
  }),
  safeStyle: computed('attributes', function() {
    const attributes = this.get('attributes');
    const style = getWithDefault(attributes, 'style');
    return style ? htmlSafe(`${style}`) : undefined;
  }),
  iconOrPositionalParam: computed('icon', 'params.[]', function () {
    if (this.icon) {
      return this.icon;
    }
    if (this.params && this.params.length) {
      return this.params[0];
    }

    return null;
  }),
  abstractIcon: computed(
    'prefix',
    'icon',
    'transform',
    'mask',
    'symbol',
    'title',
    'spin',
    'pulse',
    'fixedWidth',
    'listItem',
    'border',
    'flip',
    'size',
    'rotation',
    'pull',
    function () {
    const iconLookup = normalizeIconArgs(this.get('prefix'), this.get('iconOrPositionalParam'))
    const classes = objectWithKey('classes', [...classList.bind(this)()])
    const transformProp = this.get('transform')
    const transform = objectWithKey('transform', (typeof transformProp === 'string') ? parse.transform(transformProp) : transformProp)
    const mask = objectWithKey('mask', normalizeIconArgs(null, this.get('mask')))
    const symbol = getWithDefault(this, 'symbol', false)
    let title = getWithDefault(this, 'title', null)
    if (title) {
      title = `${title}`;
    }

    const o = assign({},
      classes,
      transform,
      mask,
      { symbol, title }
    )

    const renderedIcon = icon(iconLookup, o);
    if (!renderedIcon) {
      console.warn(`Could not find icon: iconName=${iconLookup.iconName}, prefix=${iconLookup.prefix}`)
      return null;
    }

    return renderedIcon.abstract[0];
  }),
  attributes: computed('abstractIcon.attributes', function() {
    const abstractIcon = this.get('abstractIcon');
    return abstractIcon ? abstractIcon.attributes : {};
  }),
  allClasses: computed('abstractIcon', 'attributes.class', 'class', function () {
    const abstractIcon = this.get('abstractIcon');
    if (!abstractIcon) {
      return config.replacementClass;
    }
    const attributes = this.get('attributes');
    const iconClasses = getWithDefault(attributes, 'class');

    return iconClasses;
  }),
  'data-prefix': computed('attributes.data-prefix', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'data-prefix');
  }),
  'data-icon': computed('attributes.data-icon', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'data-icon');
  }),
  'data-fa-transform': computed('attributes.data-fa-transform', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'data-fa-transform');
  }),
  'data-fa-mask': computed('attributes.data-fa-mask', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'data-fa-mask');
  }),
  'data-fa-processed': computed('attributes.data-fa-processed', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'data-fa-processed');
  }),
  'aria-hidden': computed('attributes.aria-hidden', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'aria-hidden');
  }),
  'aria-labelledby': computed('attributes.aria-labelledby', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'aria-labelledby');
  }),
  'focusable': computed('attributes.focusable', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'focusable');
  }),
  'role': computed('attributes.role', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'role');
  }),
  'xmlns': computed('attributes.xmlns', function () {
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'xmlns');
  }),
  'viewBox': computed('attributes.viewBox', function () {
    const abstractIcon = this.get('abstractIcon');
    if (!abstractIcon) {
      return '0 0 448 512';
    }
    const attributes = this.get('attributes');
    return getWithDefault(attributes, 'viewBox');
  }),
});

// Enables {{fa-icon 'iconnamehere'}} syntax, while still allowing {{fa-icon icon='iconnamehere'}}
IconComponent.reopenClass({
  positionalParams: 'params'
});

export default IconComponent;
