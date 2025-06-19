<template>
  <div class="markdown-content" v-html="renderedContent" ref="contentRef"></div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, watch } from 'vue';
import { marked } from 'marked';

interface Props {
  content: string;
}

const props = defineProps<Props>();
const contentRef = ref<HTMLElement>();

const renderedContent = computed(() => {
  if (!props.content) return '';
  
  try {
    return marked(props.content);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return props.content;
  }
});

const copyToClipboard = async (text: string, button: HTMLElement) => {
  try {
    await navigator.clipboard.writeText(text);
    
    // Visual feedback
    const originalText = button.innerHTML;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
      <span>Copied!</span>
    `;
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

const addCopyButtons = () => {
  if (!contentRef.value) return;
  
  const codeBlocks = contentRef.value.querySelectorAll('pre code');
  
  codeBlocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;
    if (!pre || pre.querySelector('.copy-button')) return; // Already has copy button
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="m5,15 0,-12c0,-1.1 0.9,-2 2,-2l12,0"></path>
      </svg>
      <span>Copy</span>
    `;
    
    copyButton.addEventListener('click', () => {
      copyToClipboard(codeBlock.textContent || '', copyButton);
    });
    
    // Create wrapper for positioning
    pre.style.position = 'relative';
    pre.appendChild(copyButton);
  });
};

// Watch for content changes and add copy buttons
watch(renderedContent, () => {
  nextTick(() => {
    addCopyButtons();
  });
});

onMounted(() => {
  addCopyButtons();
});
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin: 1em 0;
  position: relative;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

/* Copy button styles */
.markdown-content :deep(.copy-button) {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0.5em 0.75em;
  font-size: 0.75em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25em;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  opacity: 0;
  transform: translateY(-2px);
}

.markdown-content :deep(pre:hover .copy-button) {
  opacity: 1;
  transform: translateY(0);
}

.markdown-content :deep(.copy-button:hover) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.markdown-content :deep(.copy-button.copied) {
  background: rgba(34, 197, 94, 0.9);
  color: white;
  border-color: rgba(34, 197, 94, 0.3);
}

.markdown-content :deep(.copy-button svg) {
  flex-shrink: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin-bottom: 1em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
  color: #6b7280;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5em;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .markdown-content :deep(.copy-button) {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .markdown-content :deep(.copy-button:hover) {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }
}
</style>