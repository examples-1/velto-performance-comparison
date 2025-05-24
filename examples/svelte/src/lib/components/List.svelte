<script>
  let count = 0;
  let list = $state([]);
  let running = false;

  const el = document.createElement('div');
  el.addEventListener('click', () => {
    for (let j = 0; j < 50; j++) {
      list.unshift({
        id: count++,
        name: "小丽 unshift",
        grade: "一年级",
        age: 8,
      });
    }
  });

  const batchAdd = async () => {
    running = true;
    let i = 0;
    const autoClick = () => {
      i++;
      el.click();

      if (i < 400) {
        setTimeout(autoClick, 200);
      } else {
        running = false;
      }
    }
    autoClick();
  }
</script>
<button onclick={batchAdd} disabled={running} style="margin-right: 20px;">
  Batch Add
</button>
<button onclick={() => el.click()} disabled={running.value}>
  Single Add
</button>

<div class="list">
  {#each list as student, i}
  <div class="item">
      <div>{student.id}</div>
      <div>{student.name}</div>
      <div>{student.grade}</div>
      <div>{student.age}</div>
    </div>
 {/each}
</div>

<style>
.wrap {
  padding: 6px;
}
.list {
  display: flex;
  flex-direction: column;
}
.item {
  display: flex;
  flex-direction: row;
}
</style>