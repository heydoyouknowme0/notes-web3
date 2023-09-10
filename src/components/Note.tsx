import { Add, Category, Delete, Done } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import CreateArea from './CreateArea';
import { Fab } from '@mui/material';
import { backend } from '../declarations/backend';

interface Note {
  title: string;
  content: string;
}

interface NotesData {
  [Category: string]: Note[];
}

const initialData: NotesData = {
  uncat: [],
};
type List = [] | [[Note, List]];
type Notes = [] | [[Note, List]];

const Note = () => {
  const [notes, setNotes] = useState<NotesData>(initialData);
  const [isDragging, setIsDragging] = useState<{
    category: string;
    index: number;
  } | null>(null);
  const [categoryInputVisible, setCategoryInputVisible] =
    useState<boolean>(false);
  const [category, setCategory] = useState<string>('');

  let dragArea: { category: string; index: number | null } | null = null;
  useEffect(() => {
    fetchData();
  }, []);

  const flattenInputData = (inputData: [string, Notes][]) => {
    const result: NotesData = {};
    let i: string;
    const flattenRecursively = (data: Array<any> | Note | string) => {
      if (Array.isArray(data)) {
        for (const item of data) {
          flattenRecursively(item);
        }
      } else if (typeof data === 'object') {
        result[i].push(data);
      } else if (typeof data === 'string') {
        i = data;
        result[i] = [];
      }
    };

    flattenRecursively(inputData);
    return result;
  };
  const fetchData = async () => {
    const notesArray = await backend.getNotes();
    const notesData: NotesData = flattenInputData(notesArray);
    setNotes(notesData);
  };
  const addNote = (newNote: Note) => {
    const categorizedNote = {
      title: newNote.title,
      content: newNote.content,
    };

    setNotes((prevNotes) => ({
      ...prevNotes,
      uncat: [categorizedNote, ...prevNotes['uncat']],
    }));
    backend.addNote('uncat', newNote.title, newNote.content);
  };

  const dragEnd = () => {
    if (!dragArea || !isDragging) {
      setIsDragging(null);
      return;
    }
    const { category: fromCategory, index: fromIndex } = isDragging;
    const { category: toCategory, index: toIndex } = dragArea;

    if (fromCategory === toCategory && fromIndex === toIndex) {
      setIsDragging(null);
      return;
    }

    const fromNotes = notes[fromCategory];
    const toNotes = notes[toCategory];
    const fromNote = fromNotes[fromIndex];

    fromNotes.splice(fromIndex, 1);

    if (toIndex === null) {
      toNotes.unshift(fromNote);
      backend.topCategory(fromCategory, toCategory, fromIndex as any);
    } else {
      toNotes.splice(toIndex, 0, fromNote);
      backend.swapCategory(
        fromCategory,
        toCategory,
        fromIndex as any,
        toIndex as any,
      );
    }

    setNotes({
      ...notes,
      [fromCategory]: fromNotes,
      [toCategory]: toNotes,
    });

    setIsDragging(null);
    dragArea = null;
  };

  const deleteNote = (category: string, id: number) => {
    setNotes((prevNotes) => {
      const categoryNotes = [...prevNotes[category]];
      categoryNotes.splice(id, 1);

      const updatedNotes = {
        ...prevNotes,
        [category]: categoryNotes,
      };

      return updatedNotes;
    });
    backend.removeNote(id as any, category);
  };

  const dragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
    category: string,
  ) => {
    setTimeout(() => {
      setIsDragging({ index, category });
    }, 0);
  };

  const dragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setTimeout(() => {
      dragArea = null;
    }, 20);
    e.currentTarget.classList.remove('drop');
  };

  const addCategory = () => {
    if (category.trim() !== '') {
      setNotes((prevNotes) => ({
        ...prevNotes,
        [category]: [],
      }));
      backend.addCategory(category);
      setCategory('');
      setCategoryInputVisible(false);
    }
  };

  const dragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    category: string,
    index: number | null,
  ) => {
    e.preventDefault();
    e.currentTarget.classList.add('drop');
    dragArea = { index, category };
  };

  return (
    <>
      <CreateArea onAdd={addNote} />
      {Object.entries(notes).map(([category, notes]) => (
        <div className="width" key={category}>
          <h2
            onDragEnter={(e) => dragEnter(e, category, null)}
            onDragLeave={dragLeave}
          >
            {category}
          </h2>
          <div className="griddy">
            {notes.map((note, index) => (
              <div
                className={`note ${
                  isDragging?.category === category &&
                  isDragging.index === index
                    ? 'selected'
                    : ''
                }`}
                draggable
                key={index + category}
                onDragStart={(e) => dragStart(e, index, category)}
                onDragEnter={(e) => dragEnter(e, category, index)}
                onDragLeave={dragLeave}
                onDragEnd={dragEnd}
              >
                <h1>{note.title}</h1>
                <p>{note.content}</p>
                <button onClick={() => deleteNote(category, index)}>
                  <Delete />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {categoryInputVisible ? (
        <>
          <input
            className="create"
            placeholder="Enter category name"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={addCategory}
            autoFocus
          />
          <Fab onClick={addCategory}>
            <Done />
          </Fab>
        </>
      ) : (
        <Fab onClick={() => setCategoryInputVisible(true)}>
          <Add />
        </Fab>
      )}
    </>
  );
};

export default Note;
