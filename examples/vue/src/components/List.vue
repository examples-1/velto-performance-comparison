<template>
  <div class="wrap">
      <button @click="batchAdd" :disabled="running" style="margin-right: 20px;">
        Batch Add
      </button>
      <button @click="singleAdd" :disabled="running">
        Single Add
      </button>
      <div class="list">
        <div class="item" v-for="(student, index) in list" :key="index">
          <div>{{student.id}}</div>
          <div>{{student.name}}</div>
          <div>{{student.grade}}</div>
          <div>{{student.age}}</div>
        </div>
      </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';

const el = document.createElement('div');
el.addEventListener('click', () => {
  for (let j = 0; j < 50; j++) {
    list.value.unshift({
      id: count++,
      name: "小丽 unshift",
      grade: "一年级",
      age: 8,
    });
  }
});

let count = 0;
const list = ref([]);
const running = ref(false);

const singleAdd = async () => {
  el.click();
}

const batchAdd = async () => {
  running.value = true;
  let i = 0;
  const autoClick = () => {
    i++;
    el.click();

    if (i < 400) {
      setTimeout(autoClick, 200);
    } else {
      running.value = false;
    }
  }
  autoClick();
}
</script>
<style lang="scss" scoped>
.wrap {
  padding: 6px;

  .list {
    display: flex;
    flex-direction: column;

    .item {
      display: flex;
      flex-direction: row;
    }
  }
}
</style>