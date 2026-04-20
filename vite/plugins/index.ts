import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import type { PluginOption } from 'vite'

export default function createVitePlugins(): PluginOption[] {
  const vitePlugins: PluginOption[] = [vue()]

  // qiankun 插件
  vitePlugins.push(
    qiankun('template', {
      useDevMode: true
    })
  )

  // 自动导入配置
  vitePlugins.push(
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      }
    })
  )

  // 组件自动导入
  vitePlugins.push(
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  )

  return vitePlugins
}