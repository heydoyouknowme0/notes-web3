import { Add } from '@mui/icons-material';
import { Fab, Zoom } from '@mui/material';
import { useState } from 'react';
interface props {
  onAdd: (note: { title: string; content: string }) => void;
}
const CreateArea = (props: props) => {
  const [isExpanded, setExpanded] = useState(false);

  const submitNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onAdd({
      title: (
        event.currentTarget.elements.namedItem('title') as HTMLInputElement
      ).value,
      content: (
        event.currentTarget.elements.namedItem('content') as HTMLInputElement
      ).value,
    });
    event.currentTarget.reset();
    setExpanded(false);
  };

  const expand = () => {
    setExpanded(true);
  };

  return (
    <div>
      <form className="create-note" onClick={expand} onSubmit={submitNote}>
        {isExpanded && <input name="title" placeholder="Title" />}

        <textarea
          name="content"
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
          required
        />
        <Zoom in={isExpanded}>
          <Fab type="submit">
            <Add />
          </Fab>
        </Zoom>
      </form>
    </div>
  );
};

export default CreateArea;
