---
title: Java 基础
---

# Java 基础 ☕

> Java 是一门面向对象的编程语言，"一次编写，到处运行"。

## 基本数据类型

| 类型 | 大小 | 范围 |
|------|------|------|
| `byte` | 8 bit | -128 ~ 127 |
| `int` | 32 bit | -2^31 ~ 2^31-1 |
| `long` | 64 bit | -2^63 ~ 2^63-1 |
| `double` | 64 bit | 双精度浮点数 |
| `boolean` | - | true / false |
| `char` | 16 bit | Unicode 字符 |

## 面向对象三大特性

### 封装

```java
public class User {
    private String name;
    private int age;

    // Getter / Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

### 继承

```java
public class Animal {
    public void speak() {
        System.out.println("...");
    }
}

public class Dog extends Animal {
    @Override
    public void speak() {
        System.out.println("汪汪！");
    }
}
```

### 多态

```java
Animal animal = new Dog();  // 父类引用指向子类对象
animal.speak();             // 输出：汪汪！
```

## 常用集合

```java
// List - 有序可重复
List<String> list = new ArrayList<>();
list.add("hello");
list.get(0);

// Map - 键值对
Map<String, Integer> map = new HashMap<>();
map.put("age", 18);
map.get("age");     // 18

// Set - 无序不重复
Set<String> set = new HashSet<>();
set.add("apple");
set.contains("apple");  // true
```

## Stream 流式操作

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Dave");

// 过滤 + 转换 + 收集
List<String> result = names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());
// [ALICE, CHARLIE, DAVE]
```

::: tip 📌 记住
`ArrayList` 查询快，`LinkedList` 插删快；
`HashMap` 不保证顺序，`LinkedHashMap` 保证插入顺序。
:::
