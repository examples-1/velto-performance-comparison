import { ref } from "@velto/runtime";

import styles from "./styles.module.scss";

let count = 0;

export default function List() {
  const list = ref([]);
  const running = ref(false);

  const el = document.createElement('div');
  el.addEventListener('click', () => {
    for (let j = 0; j < 50; j++) {
      list.value.unshift({
        id: count++,
        name: "小丽 unshift",
        grade: "一年级",
        age: 8,
      });
      list.setValue(list.value)
    }
  });

  const singleAdd = async () => {
    el.click();
  }

  const batchAdd = async () => {
    running.setValue(true);
    let i = 0;
    const autoClick = () => {
      i++;
      el.click();

      if (i < 400) {
        setTimeout(autoClick, 200);
      } else {
        running.setValue(false);
      }
    }
    autoClick();
  }

  return (
    <div class={styles.wrap}>
      <button onClick={batchAdd} disabled={running.value} style="margin-right: 20px;">
        Batch Add
      </button>
      <button onClick={singleAdd} disabled={running.value}>
        Single Add
      </button>
      <div class={styles.list}>
        {list.value.map((student) => (
          <div class={styles.item}>
            <div>{student.id}</div>
            <div>{student.name}</div>
            <div>{student.grade}</div>
            <div>{student.age}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
