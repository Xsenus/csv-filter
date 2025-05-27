import React from 'react';
import styles from './DynamicFilterPanel.module.css';

interface Props {
  label: string;
  field: string;
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
  requestUrl: string;
  extraLabelElement?: React.ReactNode;
}

const DynamicFilterPanel: React.FC<Props> = ({
  label,
  field,
  options,
  selected,
  onSelect,
  requestUrl,
  extraLabelElement,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h4 style={{ margin: 0 }}>{label}</h4>
        {extraLabelElement}
      </div>
      <code style={{ fontSize: '12px', color: '#888' }}>{requestUrl}</code>
      <div className={styles.filterWrap}>
        {options.map((option) => (
          <button
            key={option}
            className={`${styles.option} ${selected.includes(option) ? styles.selected : ''}`}
            onClick={() => onSelect(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DynamicFilterPanel;
