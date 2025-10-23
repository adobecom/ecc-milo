/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
:host {
  display: block;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
}

:host([isopen]) {
  pointer-events: all;
}

.side-panel-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s ease;
  pointer-events: none;
}

.side-panel-overlay.open {
  background: rgba(0, 0, 0, 0.5);
  pointer-events: all;
}

.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 90vw;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 10000;
}

.side-panel.open {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e1e1e1;
  flex-shrink: 0;
}

.panel-title-section {
  flex: 1;
  min-width: 0;
}

.panel-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  color: #2c2c2c;
}

.resource-title {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #6e6e6e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6e6e6e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  padding: 0;
  margin-left: 16px;
}

.close-button:hover {
  background: #f5f5f5;
  color: #2c2c2c;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6e6e6e;
}

.loading-state p {
  margin-top: 16px;
  font-size: 14px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6e6e6e;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding-bottom: 32px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1473e6;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #1473e6;
  z-index: 1;
  flex-shrink: 0;
}

.change-type-create .timeline-dot {
  background: #2d9d78;
  box-shadow: 0 0 0 2px #2d9d78;
}

.change-type-update .timeline-dot {
  background: #1473e6;
  box-shadow: 0 0 0 2px #1473e6;
}

.change-type-delete .timeline-dot {
  background: #e34850;
  box-shadow: 0 0 0 2px #e34850;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: #e1e1e1;
  margin-top: 4px;
  min-height: 40px;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.change-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.change-type-create .change-type-badge {
  background: #d5f0e6;
  color: #1f7f5c;
}

.change-type-update .change-type-badge {
  background: #d4e8ff;
  color: #0d5dc1;
}

.change-type-delete .change-type-badge {
  background: #ffd5d9;
  color: #c9252d;
}

.timeline-date {
  font-size: 13px;
  color: #6e6e6e;
  white-space: nowrap;
}

.timeline-summary {
  font-size: 15px;
  color: #2c2c2c;
  margin-bottom: 8px;
  line-height: 1.5;
  font-weight: 500;
}

.timeline-user {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 13px;
  color: #2c2c2c;
  font-weight: 500;
}

.user-email {
  font-size: 12px;
  color: #6e6e6e;
}

/* Scrollbar styling */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .side-panel {
    width: 100vw;
    max-width: 100vw;
  }
  
  .panel-header {
    padding: 16px;
  }
  
  .panel-content {
    padding: 16px;
  }
  
  .panel-title {
    font-size: 20px;
  }
}
`;

