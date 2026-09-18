import { render, screen } from '@testing-library/react';
import { StoryCard } from './StoryCard';
import { DEFAULT_DESIGN } from '@/domain/design';

describe('StoryCard', () => {
  it('renders the Arabic text, translation, source and footer', () => {
    render(
      <StoryCard
        design={{
          ...DEFAULT_DESIGN,
          kind: 'quran',
          headline: 'عنوان',
          arabic: 'نص عربي',
          translation: 'English text',
          source: 'Surah 1:1',
          footer: 'Ahmad',
        }}
        hijriLabel="1 Muharram 1447 AH"
      />,
    );
    expect(screen.getByText('نص عربي')).toBeInTheDocument();
    expect(screen.getByText('English text')).toBeInTheDocument();
    expect(screen.getByText('Surah 1:1')).toBeInTheDocument();
    expect(screen.getByText(/Ahmad/)).toBeInTheDocument();
    expect(screen.getByText(/1 Muharram 1447 AH/)).toBeInTheDocument();
  });

  it('hides the translation when disabled', () => {
    render(
      <StoryCard
        design={{ ...DEFAULT_DESIGN, arabic: 'نص', translation: 'Hidden', showTranslation: false }}
      />,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});
