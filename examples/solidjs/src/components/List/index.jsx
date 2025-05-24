import { createSignal } from "solid-js";

import styles from "./styles.module.scss";

let count = 0;

export default function List() {
  const [list, setList] = createSignal([]);
  const [running, setRunning] = createSignal(false);

  const el = document.createElement('div');
  el.addEventListener('click', () => {
    for (let j = 0; j < 50; j++) {
      const item = {
        id: count++,
        name: "小丽 unshift",
        grade: "一年级",
        age: 8,
      };
      setList((oldList) => [item, ...oldList]);
    }
  });

  const singleAdd = async () => {
    el.click();
  }

  const batchAdd = async () => {
    setRunning(true);
    let i = 0;
    const autoClick = () => {
      i++;
      el.click();

      if (i < 400) {
        setTimeout(autoClick, 200);
      } else {
        setRunning(false);
      }
    }
    autoClick();
  }

  return (
    <div className={styles.wrap}>
      <button onClick={batchAdd} disabled={running()} style={{marginRight: '20px'}}>
        Batch Add
      </button>
      <button onClick={singleAdd} disabled={running()}>
        Single Add
      </button>
      <div className={styles.list}>
      <For each={list()}>
        {(student, i) => (
          <div className={styles.item} key={student.id}>
            <div>{student.id}</div>
            <div>{student.name}</div>
            <div>{student.grade}</div>
            <div>{student.age}</div>
          </div>
        )}
      </For>
      </div>
    </div>
  );
}
