/*
 * Copyright [2019] [Doric.Pub]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//
//  DoricRegistry.h
//  Doric
//
//  Created by pengfei.zhou on 2019/7/27.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface DoricRegistry : NSObject

- (NSString *)acquireJSBundle:(NSString *)name;

- (void)registerJSBundle:(NSString *)bundle withName:(NSString *)name;


- (void)registerNativePlugin:(Class)pluginClass withName:(NSString *)name;

- (Class)acquireNativePlugin:(NSString *)name;

- (void)registerViewNode:(Class)nodeClass withName:(NSString *)name;

- (Class)acquireViewNode:(NSString *)name;
@end

NS_ASSUME_NONNULL_END